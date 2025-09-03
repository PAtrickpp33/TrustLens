import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
from pathlib import Path
from data.crud import insert_email

# Tests for get_dataset
@patch("data.crud.insert_email.pd.read_parquet")
@patch("data.crud.insert_email.Path.rglob")
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

@patch("data.crud.insert_email.pd.read_csv")
@patch("data.crud.insert_email.Path.rglob")
def test_get_dataset_csv(mock_rglob, mock_read_csv, tmp_path):
    fake_file = tmp_path / "email_clean.csv"
    fake_file.touch()
    mock_rglob.return_value = [fake_file]
    mock_df = pd.DataFrame({"col": ["a", "b"]})
    mock_read_csv.return_value = mock_df

    df = insert_email.get_dataset("**/*.csv")

    assert df.equals(mock_df)
    mock_read_csv.assert_called_once_with(fake_file)

@patch("data.crud.insert_email.Path.rglob")
def test_get_dataset_invalid_extension(mock_rglob, tmp_path):
    fake_file = tmp_path / "bad.txt"
    fake_file.touch()
    mock_rglob.return_value = [fake_file]

    with pytest.raises(TypeError, match="Dataset must be either .csv or .parquet"):
        insert_email.get_dataset("**/*.txt")

@patch("data.crud.insert_email.Path.rglob", return_value=[])
def test_get_dataset_not_found(mock_rglob):
    # Simulate walking until "data" folder is found but no file
    with patch("data.crud.insert_email.Path.cwd") as mock_cwd:
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
