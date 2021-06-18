import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Form, Radio, Input, Button, Table } from 'antd';
import { useSelector } from "react-redux";
import Signature from "./Signature";
import Loading from "../Loading";



function ResearchView(props) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ResearchViewInfo, setResearchViewInfo] = useState();
  const [ResultList, setResultList] = useState();
  const [ResultSum, setResultSum] = useState();
  const [Ruser, setRuser] = useState();
  const [Rerender, setRerender] = useState(true);
  const [UserDb, setUserDb] = useState();

  const [sigPadData, setSigPadData] = useState(null);

  const onSigpad = (data) => {
    setSigPadData(data);
  }

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

    let resultSum = {};
    async function getResearch(){
    let r_user = []
    await firebase.database().ref('users')
    .once('value', (snapshot) => {
      snapshot.forEach(el => {
        if(el.val().role >= "0"){
            r_user.push({
            name: el.val().name,
            part: el.val().part,
            role: el.val().role
          })
        }
      });
      setRuser(r_user);
    })  
    await firebase.database().ref('research')
    .child(props.location.state.uid)
    .once("value", (snapshot) => {
      setResearchViewInfo(snapshot.val())
      snapshot.val().option && snapshot.val().option.forEach(el => {
        resultSum[el.option] = 0;
      })
    });    
    let color = ['#373f92','#1a95ce','#10acb9','#49b963','#c5be26','#f8900b','#f1723b','#de2715','#a14198'];
    firebase.database().ref(`research/${props.location.state.uid}/result`)
    .once("value", (snapshot) => {      
      let resultArr = [];
      let sumArr = [];
      for(let key in resultSum){
        resultSum[key] = 0;
      }
      snapshot.forEach(el => {
        resultSum[el.val().option] += 1;
        resultArr.push(el.val())
      })
      let colNum = 9;
      for(let key in resultSum){        
        let colSel = Math.floor(Math.random() * colNum);
        sumArr.push({
          name: key,
          count: resultSum[key],
          color:color[colSel]
        })
        color = color.filter((el) => el !== color[colSel]);
        colNum -= 1;
      }
      sumArr = sumArr.sort((a,b) => {
        if(a.count < b.count){
          return 1;
        }
        if(a.count > b.count){
          return -1;
        }
        return 0;
      })
      setResultSum(sumArr)
      r_user.map(el => {
        resultArr.map(list => {
          if(el.name == list.name && el.part == list.part){
            el.option = list.option ? list.option : '';
            el.sign = list.sign ? list.sign : '';
          }
        })
      })
      setResultList(r_user)
    })};
    getResearch();
    return () => {      
    }
  }, [Rerender])


  const onFinish = (values) => {
    
    let result = {
      name:userInfo.displayName,
      part:userInfo.photoURL,
      option:values.select_op ? values.select_op : '',
      sign:sigPadData ? sigPadData : ''
    };
    firebase.database().ref(`research/${props.location.state.uid}/result/${userInfo.uid}`)
    .update({...result})
    setRerender(!Rerender)
  }

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      align: 'center'
    },
    {
      title: '부서',
      dataIndex: 'part',
      key: 'part',
      align: 'center',
    },
    {
      title: '답변',
      dataIndex: 'select',
      key: 'select',
      align: 'center',
    },
    {
      title: '서명',
      dataIndex: 'sign',
      key: 'sign',
      align: 'center',
      render: text => text ? <img style={{height:"40px"}} src={text} /> : '',
    },
  ]
  

  return (
    <>
      {ResearchViewInfo &&
        <>         
        <Form
        name="validate_other"
        onFinish={onFinish}
        >
          <dl className="board-view-basic">
            <dt>{ResearchViewInfo.title}</dt>
            <dd>
              {ResearchViewInfo.type == 1 &&
                <Form.Item name="select_op" label="선택항목">
                  <Radio.Group >
                    {ResearchViewInfo.option.map((el,idx) => (
                      <>
                        <Radio key={idx} value={el.option}>{el.option}</Radio>
                      </>
                    ))}
                  </Radio.Group>
                </Form.Item>
              }
              {ResearchViewInfo.type == 2 && 
                <Form.Item name="select_op">
                  <div className="flex-box">
                    <span className="tit">답변</span>
                    <Input />
                  </div>
              </Form.Item>
              }
              <div className="flex-box">
                <span className="tit">서명</span>
                <Signature onSigpad={onSigpad} />
              </div>
              <div className="btn-box">
                <Button htmlType="submit" type="primary">참여하기</Button>
              </div>
            </dd>
          </dl>
        </Form>
        
      
      {Ruser && ResultList &&
        <>
        <Table pagination={false} align="center" columns={columns} dataSource={ResultList} />
        
        {ResearchViewInfo.type == 1 &&
          <ul className="research-chart">
            {ResultSum && ResultSum.map((el,idx) => (
              <li key={idx} style={{width:`${(el.count/ResultList.length*100).toFixed(1)}%`,backgroundColor:`${el.color}`}}>
                <span>{el.name} </span>
                <span>{el.count}표({el.count ? (el.count/ResultList.length*100).toFixed(1): '0'}%)</span>
              </li>
            ))}
          </ul>
        }
        </>
      }
      </>
      }
      {!ResearchViewInfo && 
        <>          
          <Loading />
        </>
      }  
    </>
  )
}

export default ResearchView
