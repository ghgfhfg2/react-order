import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Radio } from "antd";

function AdminOrderList() {

  const [OrderList, setOrderList] = useState([]);
  const [SelectDay, setSelectDay] = useState();
  const [LastDay, setLastDay] = useState()
  const [PrevDay, setPrevDay] = useState()
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
    </>
  );
}

export default AdminOrderList;
