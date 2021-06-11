import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Form, Radio, Input, Button } from 'antd';
import { useSelector } from "react-redux";

function ResearchView(props) {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ResearchViewInfo, setResearchViewInfo] = useState();
  const [ResultList, setResultList] = useState();
  const [ResultSum, setResultSum] = useState();
  const [Ruser, setRuser] = useState();
  const [Rerender, setRerender] = useState(true);

  const [UserDb, setUserDb] = useState();
  useEffect(() => {
    if(userInfo){
      firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .once("value", (snapshot) => {
        console.log(snapshot.val())
        setUserDb(snapshot.val());
      });
    }
    return () => {
    }
  }, [Rerender])

  useEffect(() => {
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
            role: el.val().role,
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
      option:values.select_op
    };
    firebase.database().ref(`research/${props.location.state.uid}/result/${userInfo.uid}`)
    .update({...result})
    setRerender(!Rerender)
  }

  const onDelete = () => {
    console.log(props.location.state.uid)
    firebase.database().ref(`research/${props.location.state.uid}`)
    .remove()
  }

  return (
    <>
      {ResearchViewInfo && 
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
                <Form.Item name="select_op" label="답변">
                  <Input />
              </Form.Item>
              }
              <Button htmlType="submit">참여하기</Button>
            </dd>
          </dl>
        </Form>
      }
      {UserDb && UserDb.role > 2 && <Button onClick={onDelete}>삭제</Button>}
      {Ruser && ResultList &&
        <>
        <table className="fl-table">
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">부서</th>
              <th scope="col">선택</th>
            </tr>
          </thead>
          <tbody>
            {ResultList.map((el,idx) => (
            <tr key={idx}>
              <td>{el.name}</td>
              <td>{el.part}</td>
              <td>{el.option}</td>
            </tr>
            ))}
          </tbody>
        </table>
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
  )
}

export default ResearchView
