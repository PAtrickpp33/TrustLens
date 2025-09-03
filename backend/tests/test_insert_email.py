import pytest
from unittest.mock import patch, call, MagicMock
import pandas as pd
from pathlib import Path
from data.crud import insert_email

# Helper fixture for post
@pytest.fixture
def sample_records():
    # Matches your screenshot shape
    return [
        {
            "address": "alice@example.com",
            "risk_level": 3,
            "notes": "",
            "mx_valid": 0,
            "disposable": 0,
        },
        {
            "address": "bob@example.com",
            "risk_level": 0,
            "notes": "ok",
            "mx_valid": 1,
            "disposable": 0,
        },
        {
            "address": "carol@www.com",
            "risk_level": 3,
            "notes": "",
            "mx_valid": 0,
            "disposable": 0,
        },
    ]

API_URL = "https://api.example.com/api/v1/email/import"

# Tests for get_dataset
@patch("data.crud.utils.pd.read_parquet")
@patch("data.crud.utils.Path.rglob")
def test_get_dataset_parquet(mock_rglob, mock_read_parquet, tmp_path):
    # Arrange
    fake_file = tmp_path / "email_clean.parquet"
    fake_file.touch()
    mock_rglob.return_value = [fake_file]
    mock_df = pd.DataFrame({"col": [1, 2]})
    mock_read_parquet.return_value = mock_df

    # Act
    df = insert_email.get_dataset("**/*.parquet")

    # Assert
    assert df.equals(mock_df)
    mock_read_parquet.assert_called_once_with(fake_file)

@patch("data.crud.utils.pd.read_csv")
@patch("data.crud.utils.Path.rglob")
def test_get_dataset_csv(mock_rglob, mock_read_csv, tmp_path):
    fake_file = tmp_path / "email_clean.csv"
    fake_file.touch()
    mock_rglob.return_value = [fake_file]
    mock_df = pd.DataFrame({"col": ["a", "b"]})
    mock_read_csv.return_value = mock_df

    df = insert_email.get_dataset("**/*.csv")

    assert df.equals(mock_df)
    mock_read_csv.assert_called_once_with(fake_file)

@patch("data.crud.utils.Path.rglob")
def test_get_dataset_invalid_extension(mock_rglob, tmp_path):
    fake_file = tmp_path / "bad.txt"
    fake_file.touch()
    mock_rglob.return_value = [fake_file]

    with pytest.raises(TypeError, match="Dataset must be either .csv or .parquet"):
        insert_email.get_dataset("**/*.txt")

@patch("data.crud.utils.Path.rglob", return_value=[])
def test_get_dataset_not_found(mock_rglob):
    # Simulate walking until "data" folder is found but no file
    with patch("data.crud.utils.Path.cwd") as mock_cwd:
        p = Path("/tmp/backend/data")
        mock_cwd.return_value = p
        with pytest.raises(RuntimeError, match="Dataset not found"):
            insert_email.get_dataset("**/*.csv")

# Tests for chunk_records
def test_chunk_records_even_split():
    records = list(range(10))  # 10 items
    chunks = list(insert_email.chunk_records(records, chunk_size=5))
    assert chunks == [list(range(0, 5)), list(range(5, 10))]


def test_chunk_records_with_remainder():
    records = list(range(12))  # 12 items
    chunks = list(insert_email.chunk_records(records, chunk_size=5))
    assert chunks == [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11],
    ]

def test_chunk_records_small_chunk_size():
    records = [1, 2, 3]
    chunks = list(insert_email.chunk_records(records, chunk_size=1))
    assert chunks == [[1], [2], [3]]

def test_chunk_records_empty_list():
    records = []
    chunks = list(insert_email.chunk_records(records, chunk_size=5))
    assert chunks == []

def test_chunk_records_bad_size():
    with pytest.raises(ValueError):
        list(insert_email.chunk_records([1, 2, 3], chunk_size=0))

# Batch_post tests
@patch("data.crud.utils.requests.post")
def test_batch_post_sends_correct_payload_per_batch(mock_post, sample_records, capsys):
    # Arrange
    resp1 = MagicMock(status_code=200)
    resp1.json.return_value = {"inserted": 2}
    resp2 = MagicMock(status_code=207)  # partial success
    resp2.json.return_value = {"inserted": 1, "errors": [{"idx": 0, "msg": "dupe"}]}
    mock_post.side_effect = [resp1, resp2]

    batches = [
        sample_records[:2],   # first batch of 2
        sample_records[2:],   # second batch of 1
    ]

    # Act
    insert_email.batch_post(batches, API_URL, verbose=True, timeout=5.0)

    # Assert calls: URL + JSON body shape {"items": batch}
    expected_calls = [
        call(API_URL, json={"items": batches[0]}, timeout=5.0),
        call(API_URL, json={"items": batches[1]}, timeout=5.0),
    ]
    assert mock_post.call_args_list == expected_calls

    # And printed output (since verbose=True)
    out = capsys.readouterr().out
    assert "Status code: 200" in out and "Status code: 207" in out
    assert ('"inserted": 2' in out) or ("'inserted': 2" in out)
    assert '"errors"' in out or "'errors'" in out


@patch("data.crud.utils.requests.post")
def test_batch_post_handles_non_json_response_in_verbose(mock_post, sample_records, capsys):
    resp = MagicMock(status_code=500, text="Internal Server Error")
    resp.json.side_effect = ValueError("No JSON")   # non-JSON response body
    mock_post.return_value = resp

    insert_email.batch_post([sample_records[:1]], API_URL, verbose=True)

    out = capsys.readouterr().out
    assert "Status code: 500" in out
    assert "Response (text): Internal Server Error" in out


@patch("data.crud.utils.requests.post")
def test_batch_post_raises_if_api_url_missing(mock_post, sample_records):
    with pytest.raises(ValueError, match="API_URL is not configured"):
        insert_email.batch_post([sample_records], api_url=None)


@patch("data.crud.utils.requests.post")
def test_batch_post_propagates_request_exception(mock_post, sample_records):
    from requests.exceptions import RequestException
    mock_post.side_effect = RequestException("boom")

    with pytest.raises(RequestException):
        insert_email.batch_post([sample_records], API_URL)


@patch("data.crud.utils.requests.post")
def test_batch_post_large_batches_through_chunker(mock_post, sample_records):
    """Chunk 5 items into size 2 and ensure 3 POSTs happen."""
    mock_post.return_value = MagicMock(status_code=200, json=lambda: {"ok": True})

    # 5 records => 3 batches of size 2, 2, 1
    records = sample_records + [
        {"address": "dan@example.com", "risk_level": 3, "notes": "", "mx_valid": 0, "disposable": 0},
        {"address": "erin@example.com", "risk_level": 1, "notes": "suspect", "mx_valid": 0, "disposable": 1},
    ]
    batches = list(insert_email.chunk_records(records, chunk_size=2))

    insert_email.batch_post(batches, API_URL, verbose=False)

    assert mock_post.call_count == 3
    first_payload = mock_post.call_args_list[0].kwargs["json"]
    assert list(first_payload.keys()) == ["items"]
    assert first_payload["items"] == records[:2]