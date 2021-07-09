import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import { Form, DatePicker, Input, Button, Table, Space } from 'antd';
import Signature from "../Signature";
import { getFormatDate } from '../CommonFunc';
import uuid from "react-uuid";

function Hair() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [UserDb, setUserDb] = useState();
  const [sigPadData, setSigPadData] = useState(null);
  const [MyHairData, setMyHairData] = useState()

  useEffect(() => {
    if(userInfo){
      firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .once("value", (snapshot) => {
        setUserDb(snapshot.val());
      });
    }

    firebase
    .database()
    .ref(`hair/${userInfo.uid}`)
    .once("value", (snapshot) => {
      setMyHairData(snapshot.val());
      console.log(MyHairData)
    });

    return () => {
      firebase.database().ref(`users/${userInfo.uid}`).off();
    }
  }, []);
  
  const onSigpad = (data) => {
    setSigPadData(data);
  }

  const onFinish = (values)=> {
    const uid = uuid();
    console.log(values)
    values.date = getFormatDate(values.date._d)
    values.signature = sigPadData;
    console.log(values)
    firebase
    .database()
    .ref("hair")
    .child(`${userInfo.uid}/${uid}`)
    .update({
      ...values,
      part: UserDb.part,
      timestamp: new Date().getTime()
    })
  }
  
    const columns = [
      {
        title: '이름',
        dataIndex: 'name',
        key: 'name',
        align: 'center'
      },
      {
        title: '관계',
        dataIndex: 'relation',
        key: 'relation',
        align: 'center',
      },
      {
        title: '서비스명',
        dataIndex: 'service',
        key: 'service',
        align: 'center'
      },
      {
        title: '서명',
        dataIndex: 'signature',
        key: 'signature',
        align: 'center',
        render: data => data ? <img style={{height:"40px"}} src={data} /> : '',
      }
    ]
    
  return (
    <>
      <Form name="dynamic_form_nest_item" className="hiar-form" onFinish={onFinish} autoComplete="off">
        <div className="flex-box">
          <Form.Item 
          name="date"
          label="날짜">
            <DatePicker />
          </Form.Item>
          <Form.Item 
          name="name"
          label="이름">
            <Input style={{maxWidth:"100px"}}/>
          </Form.Item>
          <Form.Item 
          name="relation"
          label="관계">
            <Input style={{maxWidth:"100px"}}/>
          </Form.Item>
        </div>
        <Form.Item 
        name="service"
        label="서비스명">
          <Input />
        </Form.Item>
        <Form.Item 
        className="signature"
        name="signature"
        label="서명">
          <Signature onSigpad={onSigpad} />
        </Form.Item>
        <div className="btn-box">
          <Button type="primary" htmlType="submit">등록하기</Button>
        </div>
      </Form>

      {MyHairData &&
        <>
        <Table pagination={false} align="center" columns={columns} dataSource={MyHairData} />        
        </>
      }

    </>
  )
}

export default Hair
