import { Button } from "antd";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import firebase from "../../firebase";
import { Popover } from "antd";
import { commaNumber } from "../CommonFunc"

export const OrderBox = styled.div`
  width:100%;display:flex;flex-wrap:wrap;
  .list{
    .from{border-bottom:1px solid #ddd;height:30px;}
    diplay:flex;flex-direction:column;padding:10px;border:1px solid #ddd;
    border-radius:10px;
    width:calc(33.33% - 10px);margin:5px;
    .from{margin-bottom:5px}
    .info-box{
      height:28px;
      .info{margin-right:7px;}
      .ant-btn{height:28px;padding:0 7px;line-height:1;
        span{height:100%;line-height:28px;font-size:12px}
      }
    }
    & > div {
      display:flex;justify-content:space-between;align-items:center;width:100%;padding:0 4px;
    }
  }
`

function AdminOrder() {

const [OrderList, setOrderList] = useState([])
  useEffect(() => {
    firebase.database().ref('order')
    .orderByChild("order_state")
    .equalTo(0)
    .on('value', (snapshot) =>{
      let array = [];
      snapshot.forEach(function (item) {
        array.push({
          ...item.val(),
          key:item.key
        })
      });
      setOrderList(array);
    })
    
  }, [])
  const stateChange = (key) => {
    if(window.confirm("완료하시겠습니까?")){
    firebase.database().ref('order')
    .child(key)
    .update({
      order_state:1
    })
  }
  }

    return <>
     <OrderBox>       
        {OrderList.map((list, index) => 
        (
          <div className="list" key={index}>
            <span style={{display:"none"}}>{list.key}</span>
            <div className="from">
              <span>{list.order_name}</span>
              <span>{list.order_part}</span>
            </div>
            <div className="prod">
              <div className="info-box">
                <span className="info">{list.prod_name}</span>
                <span className="info">{list.hot}</span>
                <span className="info">{list.amount}</span>
                <Popover
                  content={list.order_etc}
                  trigger="click"
                >
                  <Button type="default">기타</Button>
                </Popover>
              </div>
              <span>{commaNumber(list.price)}원</span>
            </div>
            <div className="state">
              <span>{list.order_time}</span>
              <Button onClick={() => {stateChange(list.key)}}>완료</Button>
            </div>
          </div>
        ))     
      }
      </OrderBox> 
    </>;
  }


export default AdminOrder;
