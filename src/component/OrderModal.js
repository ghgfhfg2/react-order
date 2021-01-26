import React, { useState } from "react";
import { Form, Button, Input, Radio } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import moment from 'moment';
import 'moment/locale/ko';
import uuid from "react-uuid";
export const OderModalPopup = styled.div`
  width: auto;
  padding: 20px;
  border: 1px solid #ddd;
  position: fixed;
  z-index: 100;
  border-radius: 10px;
  background: #fff;
  transform: translate(-40%, 30px);
  left: ${(props) => props.posx}px;
  top: ${(props) => props.posy}px;
  .num{
    width:40px;text-align:center;margin:0 -1px;
  }
  .tit{display:inline-block;margin-right:5px;flex-shrink:0}
  .btn-box{margin-top:10px;display:flex;justify-content:center}
`;

function OrderModal({posx, posy, onFinished, OrderItem}) {
  const userInfo = useSelector((state) => state.user.currentUser);  
  const [Amount, setAmount] = useState(1);
  const plusAmount = () => {
    if (Amount < 10) {
      setAmount((pre) => pre + 1);
    } else {
      alert("최대 주문량은 10개 입니다.");
    }
  };
  const minusAmount = () => {
    if (Amount > 1) {
      setAmount((pre) => pre - 1);
    } else {
      alert("최소 주문량은 1개 입니다.");
    }
  };
  const onCancel = () => {
    onFinished();
  };

  const [radioValue, setradioValue] = useState();
  const radioChange = (e) => {
    setradioValue(e.target.value);
  };
    let hotRadio;
    if(OrderItem.hot === 'hot & ice'){       
      hotRadio = <>
        <label htmlFor="hot">hot</label>
        <input type="radio" checked name="hot" id="hot" value="hot" onChange={radioChange} />
        <label htmlFor="ice">ice</label>
        <input type="radio" id="ice" name="hot" value="ice" onChange={radioChange} />
      </>
    }
    if(OrderItem.hot === 'hot only'){       
      hotRadio = <>
        <label htmlFor="hot">hot only</label>
        <input type="radio" checked id="hot" name="hot" value="hot" onChange={radioChange} />
      </>
    }
    if(OrderItem.hot === 'ice only'){       
      hotRadio = <>
        <label htmlFor="ice">ice only</label>
        <input type="radio" checked id="ice" name="hot" value="ice" onChange={radioChange} />
      </>
    }
    
    
    
    // submit
    const onSubmitOrder = async (e) => {
      const nowTime = moment().format('YYYY-MM-DD HH:mm:ss|dddd');
      e.preventDefault();
      let values = {
        order_uid: userInfo.uid,
        order_email: userInfo.email,
        order_name: userInfo.displayName,
        order_part: userInfo.photoURL,
        order_time: nowTime,
        order_etc: e.target.etc.value,
        order_state: 0,
        prod_name: OrderItem.name,
        price: parseInt(OrderItem.price),
        amount: parseInt(e.target.amount.value),
        kal: parseInt(OrderItem.kal),
        hot: e.target.hot.value,
        category: OrderItem.category
      }
      try {
        await firebase
        .database()
        .ref("order")
        .child(uuid())
        .set({
          ...values
        });
        alert('주문에 성공했습니다.')
      }catch (error){
        alert(error);
      }
    }

  return (
    <>
      <OderModalPopup posx={posx} posy={posy}>
        <form className="admin-prod-form" onSubmit={onSubmitOrder}>
        {OrderItem.name}
        <div className="flex-box a-center">
          <span className="tit">수량</span>          
          <Button
            onClick={minusAmount}
            icon={<MinusOutlined />}
            type="default"
          ></Button>
          <Input className="num" name="amount" value={Amount} />
          <Button
            onClick={plusAmount}
            icon={<PlusOutlined />}
            type="default"
          ></Button>
        </div>
        <div className="flex-box a-center">
        <span className="tit">수량</span>
            {hotRadio}          
            </div>
            <div className="flex-box a-center">
        <span className="tit">기타</span>
          <Input name="etc" type="text" />
          </div>
        <div className="btn-box">
          <Button htmlType="submit" type="primary" style={{ marginRight: "5px" }}>
            주문
          </Button>
          <Button
            onClick={onCancel}
            type="default"          
          >
            취소
          </Button>
        </div>
        </form>
      </OderModalPopup>
    </>
  );
}

export default OrderModal;
