import React from 'react'
import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import uuid from "react-uuid";
import firebase from "../../firebase";


function ResearchWrite() {
  const onFinish = values => {
    console.log('Received values of form:', values);
    const uid = uuid();
    firebase.database().ref('research')
    .child(uid)
    .update({
      title:values.title,
      option:values.option_list,
      etc:values.etc ? values.etc : '',
      uid:uid
    })
  };
  return (
    <>
      <Form name="dynamic_form_nest_item" className="research-form" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="title"
          rules={[{ required: true, message: '제목을 입력해 주세요.'}]}
        >
          <Input placeholder="제목" />
        </Form.Item> 
        <Form.List name="option_list">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 5 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'option']}
                    fieldKey={[fieldKey, 'option']}
                    rules={[{ required: true, message: '항목을 입력해 주세요.' }]}
                  >
                    <Input placeholder="항목" />
                  </Form.Item>                  
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item
          name="etc"
          rules={[{ required: false}]}
        >
          <Input.TextArea placeholder="설명" />
        </Form.Item>  
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export default ResearchWrite
