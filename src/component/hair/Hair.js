import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import { Form, DatePicker, Input, Button, Table, Space } from 'antd';
import Signature from "../Signature";
import { getFormatDate, commaNumber } from '../CommonFunc';
import uuid from "react-uuid";
import moment from 'moment';
import { stubString } from "lodash";
const curDate = getFormatDate(new Date());

function Hair() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [UserDb, setUserDb] = useState();
  const [sigPadData, setSigPadData] = useState(null);
  const [MyHairData, setMyHairData] = useState();
  const [Rerender, setRerender] = useState(false);
  const [SearchDate, setSearchDate] = useState(curDate);

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

    let hairArr = [];
    firebase
    .database()
    .ref(`hair/${userInfo.uid}`)
    .once("value", (snapshot) => {
      snapshot.forEach(el=>{
        let str = el.val().date.full.toString().substr(0,6);
        if(str == SearchDate.full.substr(0,6)){
          hairArr.push(el.val())
        }
      })      
      hairArr.sort((a,b)=>{
        return b.timestamp - a.timestamp
      })
      hairArr.sort((a,b)=>{
        return b.date.full - a.date.full
      })
      setMyHairData(hairArr);
    });
    return () => {
      firebase.database().ref(`users/${userInfo.uid}`).off();
    }
  }, [Rerender,SearchDate]);
  
  const onSigpad = (data) => {
    setSigPadData(data);
  }

  const onFinish = (values)=> {
    const uid = uuid();
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
      timestamp: new Date().getTime(),
      uid:uid
    })
    setRerender(!Rerender)
  }

  const onDelete = (uid) => {
    let agree = window.confirm('삭제하면 복구가 불가능합니다. 삭제하시겠습니까?');
    if(agree){
      firebase.database().ref(`hair/${userInfo.uid}/${uid}`).remove();
      setRerender(!Rerender)
    }
  }

  const onSelectDate = (date, dateString) => {
    setSearchDate(getFormatDate(date._d))
  }
  const disabledDate = (current) => {
    return current && current > moment();
  }
  
    const columns = [
      {
        title: '날짜',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
        render: data => data ? data.full_ : '',
      },
      {
        title: '이용자와의 관계',
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
        title: '가격',
        dataIndex: 'price',
        key: 'price',
        align: 'center',
        render: data => data ? `${commaNumber(data)}` : ''
      },
      {
        title: '서명',
        dataIndex: 'signature',
        key: 'signature',
        align: 'center',
        render: data => data ? <img style={{height:"40px"}} src={data} /> : '',
      },
      {
        title: '관리',
        dataIndex: 'uid',
        key: 'uid',
        align: 'center',
        render: data => data ? <Button onClick={()=>{onDelete(data)}}>삭제</Button> : '',
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
        <div className="flex-box">
          <Form.Item 
          name="service"
          label="서비스명">
            <Input />
          </Form.Item>
          <Form.Item 
          name="price"
          label="가격">
            <Input style={{maxWidth:"100px"}}/>
          </Form.Item>
        </div>
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
        <DatePicker 
          picker="month"
          defaultValue={moment()}
          disabledDate={disabledDate} onChange={onSelectDate} 
          style={{marginTop:"20px",marginBottom:"10px"}}
        />
        <Table 
        pagination={{
          pageSize:10
        }}
        align="center" columns={columns} dataSource={MyHairData} />        
        </>
      } 

    </>
  )
}

export default Hair
