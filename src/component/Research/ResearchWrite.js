import React, { useState, useRef } from 'react'
import { Link } from "react-router-dom";
import { Form, Input, Button, Space, Radio, Checkbox, Upload, Switch, DatePicker } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import uuid from "react-uuid";
import firebase from "../../firebase";
import { getFormatDate } from "../CommonFunc";
import moment from 'moment';
const { RangePicker } = DatePicker;
function ResearchWrite() {
  const btnToList = useRef();


  const uid = uuid();


  const disabledDate = (current) => {
    return current && current < moment().subtract(1, 'days');
  }

  const [DateLimitState, setDateLimitState] = useState(false)
  const dateLimit = () => {
    setDateLimitState(!DateLimitState)
  }  
  
  const onFinish = async (values) => {
    let uploadURL = [];            
    const getImgUrl = () => {
    values.upload && values.upload.map(el=>{
    let getImg = async () => {
    let uploadTask = await firebase
        .storage()
        .ref("research")
        .child(`image/${uid}/${uuid()}`)          
        .put(el.originFileObj, el.type);
          uploadTask.ref.getDownloadURL()
          .then(url => {
            uploadURL.push(url);
            firebase.database().ref('research')
            .child(uid)
            .update({
              image: uploadURL
            });
          });
        }
        getImg();
      })
    }
    getImgUrl();

    firebase.database().ref('research')
    .child(uid)
    .update({
      title:values.title,
      type:values.type,
      option:values.option_list ? values.option_list : '',
      etc:values.etc ? values.etc : '',
      uid:uid,
      auth:values.auth ? values.auth : false,
      secret:values.secret ? values.secret : false,
      date:getFormatDate(new Date()).full_,
      timestamp:new Date().getTime(),
      limit_start:values.time_limit ? values.time_limit[0]._d.getTime() : 0,
      limit_end:values.time_limit ? values.time_limit[1]._d.getTime() : 99999999999999,
    });

    btnToList.current.click();
  };

  const [TypeState, setTypeState] = useState()
  const typeOptions = [
    {label: '문항선택형', value: 1},
    {label: '답변작성형', value: 2},
    {label: '문항답변형', value: 3}
  ]
  const onChangeType = (e) => {
    setTypeState(e.target.value)
  }

  const normFile = (e) => {
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
          label="유형 선택"
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
        {TypeState && TypeState == 3 &&
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
                    <Form.Item
                      {...restField}
                      name={[name, 'answer']}
                      fieldKey={[fieldKey, 'answer']}
                      rules={[{ required: true, message: '항목을 입력해 주세요.' }]}
                    >
                      <Input placeholder="답변" />
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
          label="이미지 업로드"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload name="logo" listType="picture">
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>
        <div className="flex-box">
          <Form.Item
            name="auth"
            valuePropName="checked"
            style={{marginRight:"13px"}}
          >
            <Checkbox>비정규직 제외</Checkbox>
          </Form.Item> 
          <Form.Item
            name="secret"
            valuePropName="checked"
          >
            <Checkbox>결과 비공개</Checkbox>
          </Form.Item> 
        </div>
        <Form.Item
          name="etc"          
          rules={[{ required: true}]}
        >
          <Input.TextArea placeholder="설명" />
        </Form.Item>  
        <Form.Item
          label="날짜설정" style={{marginBottom:"7px"}}
        >
          <Switch onChange={dateLimit} />
        </Form.Item>
        {DateLimitState &&
          <Form.Item
            
            name="time_limit"
          >
            <RangePicker  
              format="YYYY-MM-DD"
              disabledDate={disabledDate} 
            />
          </Form.Item>
        }

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
