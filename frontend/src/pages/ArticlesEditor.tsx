import React, { useState } from 'react';
import { Form, Input, Switch, Button, message, Space, Typography } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { http } from '@/lib/http';

const ArticlesEditor: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState<string>('');

  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        slug: values.slug,
        title: values.title,
        summary: values.summary || null,
        content_md: content,
        is_published: values.is_published ? 1 : 0,
      };
      const res = await http.post('/api/v1/articles', payload);
      if (res.data?.success) {
        message.success('Saved');
        form.resetFields();
        setContent('');
      } else {
        message.error(res.data?.error || 'Save failed');
      }
    } catch (e: any) {
      message.error(e?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-8">
      <Typography.Title level={3} style={{ marginBottom: 16 }}>Hidden Articles Editor</Typography.Title>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="slug" label="Slug" rules={[{ required: true, message: 'Please input slug' }]}> 
          <Input placeholder="unique-slug" />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input title' }]}> 
          <Input placeholder="Article title" />
        </Form.Item>
        <Form.Item name="summary" label="Summary">
          <Input.TextArea placeholder="Short summary" rows={3} maxLength={512} showCount />
        </Form.Item>
        <Form.Item label="Content (Markdown)">
          <div data-color-mode="light">
            <MDEditor value={content} onChange={(v) => setContent(v || '')} height={400} />
          </div>
        </Form.Item>
        <Form.Item name="is_published" label="Published" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
          <Button htmlType="button" onClick={() => { form.resetFields(); setContent(''); }}>Reset</Button>
        </Space>
      </Form>
    </section>
  );
};

export default ArticlesEditor;


