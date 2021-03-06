import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Radio } from "antd";
import { commaNumber } from "../CommonFunc";

function AdminOrderList() {

  const [OrderList, setOrderList] = useState([]);
  const [SelectDay, setSelectDay] = useState();
  const [LastDay, setLastDay] = useState()
  const [PrevDay, setPrevDay] = useState()
  const [SumAmount, setSumAmount] = useState()
  const [SumPrice, setSumPrice] = useState()
  const [Add1Count, setAdd1Count] = useState()
  const [Add2Count, setAdd2Count] = useState()
  const [SumAddAmount, setSumAddAmount] = useState()
  useEffect(() => {
    let mounted = true;
    if (mounted) {     
        firebase
        .database()
        .ref("order")
        .orderByChild("order_state")
        .equalTo(2)
        .on("value", (snapshot) => {
          let array = [];
          snapshot.forEach(function (item) {
            array.push({
              ...item.val(),
              key: item.key,
            });
          });
          // eslint-disable-next-line array-callback-return
          array.sort((a, b) => {
            if (a.timestamp > b.timestamp) {
              return -1;
            }
            if (a.timestamp < b.timestamp) {
              return 1;
            }
          });
          array = array.slice(0, 250);  
          const day = ['월요일','화요일','수요일','목요일','금요일']
          setLastDay(array[0].order_time.split("|")[1])
          let prevDayIndex = day.indexOf(LastDay)-1          
          if(prevDayIndex < 0){
            prevDayIndex = 4;
          }  
          setPrevDay(day[prevDayIndex]);
          if(SelectDay){           
            array = array.filter(el => {
              return el.order_time.includes(SelectDay)
            })
            let sumA = 0;
            let sumP = 0;
            let add1C = 0;
            let add2C = 0;
            array.map(el => {
              sumA += parseInt(el.amount)
              if(el.add && el.add.includes('버블')) {
                el.price -= 500;
                add1C += 1
              }
              if(el.add2 && el.add2.includes('샷1')) {
                el.price -= 500;                
                add2C += 1
              }
              if(el.add2 && el.add2.includes('샷2')) {
                el.price -= 1000;
                add2C += 2
              }              
            })
            setSumAmount(sumA)
            setAdd1Count(add1C)
            setAdd2Count(add2C)
            setSumAddAmount(add1C+add2C)  
            array = array.reduce((a,c)=>{
              let x = a.find(e=>(e.prod_name===c.prod_name && e.hot===c.hot))
              if(!x) a.push(Object.assign({},c))
              else {
                x.og_price += c.og_price
                x.amount += c.amount
              };
              return a
            },[])                 
            array.map(el => {
              sumP += el.price * el.amount
              el.price = el.price * el.amount
            })     
            setSumPrice(sumP)

            array = array.sort((a,b) => {
              if (a.category > b.category) {
                return -1;
              }
              if (a.category < b.category) {
                return 1;
              }
            })
          }          
          setOrderList(array);          
        });
      }
      return function cleanup() {
        firebase.database().ref("order").off();
        mounted = false;
      };
    }, [SelectDay]);
    
    const onSelectDay = (e) => {
      if(e.target.value === '1'){
        setSelectDay("")
      }
      if(e.target.value === '2'){
        setSelectDay(LastDay)
      }
      if(e.target.value === '3'){
        setSelectDay(PrevDay)
      }
    }        
  return (
    <>
      <h3 className="title">완료내역</h3>
      <Radio.Group onChange={onSelectDay} defaultValue="1" buttonStyle="solid">
        <Radio.Button value="1">전체</Radio.Button>
        <Radio.Button value="2">오늘</Radio.Button>
        <Radio.Button value="3">어제</Radio.Button>
      </Radio.Group>
      <span style={{fontSize:"13px",marginLeft:"5px"}}>(영업일 기준)</span>
      {!SelectDay && 
        <table className="fl-table" style={{marginTop:"12px"}}>
          <thead>
            <tr>
              <th scope="col">주문자</th>
              <th scope="col">상품명</th>
              <th scope="col">수량</th>
              <th scope="col" colSpan="2">추가</th>
              <th scope="col">코멘트</th>
              <th scope="col">주문시간</th>
              <th scope="col">가격</th>
            </tr>
          </thead>
          <tbody>
            {OrderList.map((list, index) => (
              <tr key={index}>
                <td>{list.order_name}</td>
                <td>
                  {list.hot === "hot" && "따뜻한 "}
                  {list.hot === "ice" && "차가운 "}
                  {list.prod_name}
                </td>
                <td>{list.amount}</td>
                <td>{list.add}</td>
                <td>{list.add2}</td>
                <td>{list.order_etc}</td>
                <td>{list.order_time}</td>
                <td>{list.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      {SelectDay && 
        <>
        <div style={{marginTop:"12px"}}>
        {OrderList[0] && 
          <span>{OrderList[0].order_time}</span>
        }        
        </div>
        <div style={{display:"flex"}}>
        <table className="fl-table" style={{marginTop:"12px",width:"48%"}}>
          <thead>
            <tr>
              <th scope="col">상품명</th>
              <th scope="col">수량</th>
              <th scope="col">가격</th>
            </tr>
          </thead>
          <tbody>
            {OrderList && OrderList.map((list, index) => (
              <tr key={index}>
                <td>
                  {list.hot === "hot" && "따뜻한 "}
                  {list.hot === "ice" && "차가운 "}
                  {list.prod_name}
                </td>
                <td>{list.amount}</td>
                <td>{list.price}</td>
              </tr>
            ))}
            <tr>
                <td>합계</td>
                <td>
                  {SumAmount}
                </td>
                <td>{commaNumber(parseInt(SumPrice))}</td>
            </tr>
          </tbody>
        </table>
        <table className="fl-table" style={{marginTop:"12px",marginLeft:"2%",width:"49%",height:"100px"}}>
        <thead>
          <tr>            
            <th scope="col">상품명</th>
            <th scope="col">수량</th>
            <th scope="col">가격</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td>버블추가</td>
              <td>{Add1Count}</td>
              <td></td>
            </tr>
            <tr>
              <td>샷추가</td>
              <td>{Add2Count}</td>
              <td></td>
            </tr>
          <tr>
              <td>합계</td>
              <td>
                {SumAddAmount}
              </td>
              <td>{commaNumber(parseInt(SumAddAmount*500))}</td>
          </tr>
        </tbody>
      </table>
      </div>
      </>
      }
    </>
  );  
}

export default AdminOrderList;
