import React, { useState, useRef } from 'react'
import { Link } from "react-router-dom";
import { Form, Input, Button, Space, Radio, Checkbox, Upload } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import uuid from "react-uuid";
import firebase from "../../firebase";


function ResearchWrite() {
  const btnToList = useRef();

  const onFinish = async (values) => {
    const uid = uuid();
    let uploadURL = [];
    
    values.upload.map(el => {
      let getImg = async () => {
      let uploadTaskSnapshot = await firebase
          .storage()
          .ref("research")
          .child(`image/${uid}`)
          .put(el.originFileObj, el.type);
        let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();
        uploadURL.push(downloadURL);
      }
      getImg();
    })  
    console.log(uploadURL);
    return;
    firebase.database().ref('research')
    .child(uid)
    .update({
      title:values.title,
      type:values.type,
      option:values.option_list ? values.option_list : '',
      etc:values.etc ? values.etc : '',
      uid:uid,
      auth:values.auth,
      image: uploadURL
    });
    btnToList.current.click();
  };

  const [TypeState, setTypeState] = useState()
  const typeOptions = [
    {label: '문항선택형', value: 1},
    {label: '답변작성형', value: 2}
  ]
  const onChangeType = (e) => {
    setTypeState(e.target.value)
  }

  const normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
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
        <Form.Item 
          name="type"
          rules={[{ required: true, message: '타입을 선택해 주세요.'}]}
        >
          <Radio.Group
            options={typeOptions}
            onChange={onChangeType}
            value={TypeState}
            optionType="button"
          />
        </Form.Item>
        {TypeState && TypeState == 1 &&
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
        }        
        <Form.Item
          name="upload"
          label="Upload"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload name="logo" action="/upload.do" listType="picture">
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="auth"
          rules={[{ required: false}]}
          valuePropName="checked"
        >
          <Checkbox>비정규직 제외</Checkbox>
        </Form.Item> 
        <Form.Item
          name="etc"
          rules={[{ required: true}]}
        >
          <Input.TextArea placeholder="설명" />
        </Form.Item>  
        <div className="flex-box j-center" style={{marginTop:"15px"}}>
          <Button type="primary" htmlType="submit" style={{width:"100px"}}>
            등록하기
          </Button>
          <Button style={{marginLeft:"5px"}}>
            <Link ref={btnToList} to="/research">목록으로</Link>
          </Button>
        </div>    
      </Form>
    </>
  )
}

export default ResearchWrite
