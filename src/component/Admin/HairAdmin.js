import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { useSelector } from "react-redux";
import { DatePicker, Button, Table } from 'antd';
import { getFormatDate, commaNumber } from '../CommonFunc';
import moment from 'moment';
const curDate = getFormatDate(new Date());

function HairAdmin() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [UserDb, setUserDb] = useState();
  const [MyHairData, setMyHairData] = useState();
  const [Rerender, setRerender] = useState(false);
  const [SearchDate, setSearchDate] = useState(curDate);
  const [TotalPrice, setTotalPrice] = useState(0);
  const [PersnalData, setPersnalData] = useState();

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
    let totalPrice = 0;    
    let personalArr = [];
    firebase
    .database()
    .ref(`hair`)
    .once("value", (snapshot) => {
      snapshot.forEach(el=>{
        let obj = el.val();
        let personalObj = {};
        let personalPrice = 0;
        let dateArr = [];
        let relArr = [];
        let serArr = [];
        let priceArr = [];
        for (let key in obj) {
          console.log("obj[key]",obj[key])
          let name = obj[key].name;
          let str = obj[key].date.full.toString().substr(0,6);
          if(str == SearchDate.full.substr(0,6)){
            personalPrice += parseInt(obj[key].price);
            dateArr.push(obj[key].date)
            relArr.push(obj[key].relation)
            serArr.push(obj[key].service)
            priceArr.push(obj[key].price)
            personalObj = {
              date : dateArr,
              name : name,
              part : obj[key].part,
              sosok : obj[key].sosok,
              timestamp : obj[key].timestamp,
              relation : relArr, 
              service : serArr, 
              price : priceArr, 
              total_price: personalPrice
            }
            hairArr.push(obj[key]);
          }
        }
        personalArr.push(personalObj);
        console.log(personalArr);
        setPersnalData(personalArr);
        setTotalPrice(totalPrice);
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
  


  const onSelectDate = (date, dateString) => {
    setSearchDate(getFormatDate(date._d))
  }
  const disabledDate = (current) => {
    return current && current > moment();
  }
  
    const columns = [
      {
        title: '이용일',
        dataIndex: 'date',
        key: 'date',
        align: 'center',
        sorter: {
          compare: (a, b) => a.date - b.date,
          multiple: 3,
        },
        render: data => data ? data.full_ : '',
      },
      {
        title: '작성일',
        dataIndex: 'timestamp',
        key: 'timestamp',
        align: 'center',
        sorter: {
          compare: (a, b) => a.timestamp - b.timestamp,
          multiple: 2,
        },
        render: data => data ? getFormatDate(new Date(data)).full_ : '',
      },
      {
        title: '소속',
        dataIndex: 'sosok',
        key: 'sosok',
        align: 'center',
        sorter: {
          compare: (a, b) => a.sosok - b.sosok,
          multiple: 1,
        },
        render: data => {
          let txt
          if(data == 1){
            txt = "미트리";
          }
          if(data == 2){
            txt = "푸드킹";
          }
          if(data == 3){
            txt = "계약직";
          }
          return txt
        }
      },
      {
        title: '부서',
        dataIndex: 'part',
        key: 'part',
        align: 'center',
      },
      {
        title: '이름',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
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
        render: data => data ? `${commaNumber(data)}원` : ''
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
      <DatePicker 
        picker="month"
        defaultValue={moment()}
        disabledDate={disabledDate} onChange={onSelectDate} 
        style={{marginTop:"20px",marginBottom:"10px"}}
      />
      <h3 className="title">개인별내역</h3>
      {PersnalData &&
        <table className="fl-table" style={{marginBottom:"20px"}}>
          <thead>
            <tr style={{borderBottom:'1px solid #ddd',borderTop:'2px solid #555'}}>
              <th scope="col">이름(소속/부서)</th>
              <th scope="col">이용일</th>
              <th scope="col">관계</th>
              <th scope="col">서비스</th>
              <th scope="col">가격</th>
              <th scope="col">총 이용횟수</th>
              <th scope="col">합계</th>
            </tr>
          </thead>
          <tbody>
          {PersnalData && PersnalData.map((el) => (
            <>
              {el.date && el.date.map((list,_idx) => (
                <>                      
                  <tr key={_idx} style={{borderBottom:'1px solid #ddd'}}>
                    {_idx == 0 &&
                    <th scope="row" rowSpan={el.date.length} style={{background:'#f1f1f1'}}>
                      {el.name}
                    </th>
                    }
                    <td>{list.full_}</td>
                    <td>{el.relation[_idx]}</td>
                    <td> {el.service[_idx]}</td>
                    <td>{commaNumber(el.price[_idx])}원</td>
                    {_idx == 0 &&
                    <>
                      <td rowSpan={el.date.length}>{el.date.length}회</td>
                      <th scope="row" rowSpan={el.date.length}>
                        {commaNumber(el.total_price)}원
                      </th>
                    </>
                    }
                  </tr>
                </>
              ))}     
            </>
          ))
          }
          </tbody>
        </table>
      }
      
      <h3 className="title">전체내역</h3>
      {MyHairData &&
        <>          
          <Table 
          pagination={{
            pageSize:10
          }}
          align="center" columns={columns} dataSource={MyHairData} 
          footer={() => (
            <>
              <div style={{textAlign:"center",fontWeight:"600"}}>가격 합계 : {commaNumber(TotalPrice)}원</div>
            </>
          )}
          /> 
  
        </>
      } 

    </>
  )
}

export default HairAdmin
