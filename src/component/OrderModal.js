import React, { useState } from "react";
import { Button, Input, Checkbox } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import moment from "moment";
import "moment/locale/ko";
import uuid from "react-uuid";
export const OderModalPopup = styled.div`
  width: auto;
  padding: 20px;
  border: 1px solid #ddd;
  position: fixed;
  z-index: 100;
  border-radius: 10px;
  background: #fff;
  transform: translate(-40%, -50%);
  left: ${(props) => props.posx}px;
  top: ${(props) => props.posy}px;
  @media all and (max-width: 640px) {
    width:80%;max-width:300px;
    left: 50%;
    transform: translate(-50%, -100%);
  }
  .num {
    width: 40px;
    text-align: center;
    margin: 0 -1px;
  }
  .tit {
    display: inline-block;
    margin-right: 5px;
    flex-shrink: 0;
  }
  .btn-box {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    button {
      width: 100px;
    }
  }
`;

function OrderModal({ posx, posy, onFinished, OrderItem }) {
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


const [AddCheck, setAddCheck] = useState()
function onChange(checkedValues) {
  setAddCheck(checkedValues)
}

  let hotRadio;
  if (OrderItem.hot === "hot & ice") {      
    hotRadio = (
      <>
        <input
          type="radio"
          name="hot"
          id="hot"
          value="hot"
          onChange={radioChange}
        />
        <label className="radio_hot" htmlFor="hot">
          hot
        </label>
        <input
          type="radio"
          id="ice"
          name="hot"
          value="ice"
          onChange={radioChange}
        />
        <label className="radio_ice" htmlFor="ice">
          ice
        </label>
      </>
    );
  }
  if (OrderItem.hot === "hot only") {
    hotRadio = (
      <>
        <input
          type="radio"
          id="hot"
          name="hot"
          value="hot"
          onChange={radioChange}
        />
        <label className="radio_hot" htmlFor="hot">
          hot only
        </label>
      </>
    );
  }
  if (OrderItem.hot === "ice only") {
    hotRadio = (
      <>
        <input
          type="radio"
          id="ice"
          name="hot"
          value="ice"
          onChange={radioChange}
        />
        <label className="radio_ice" htmlFor="ice">
          ice only
        </label>
      </>
    );
  }

  // submit
  const onSubmitOrder = async (e) => {
    const nowTime = moment().format("YYYY-MM-DD HH:mm:ss|dddd");
    const timeStamp = new Date().getTime();
    e.preventDefault();

    if (!radioValue) {
      alert("온도를 선택해주세요");
      return;
    }
    let values = {
      order_uid: userInfo.uid,
      order_email: userInfo.email,
      order_name: userInfo.displayName,
      order_part: userInfo.photoURL,
      order_time: nowTime,
      order_etc: e.target.etc.value,
      order_state: 0,
      prod_name: OrderItem.name,
      price: OrderItem.price * e.target.amount.value,
      amount: parseInt(e.target.amount.value),
      kal: parseInt(OrderItem.kal),
      hot: e.target.hot.value,
      add:AddCheck,
      category: OrderItem.category,
      timestamp: timeStamp,
    };

    try {
      await firebase
        .database()
        .ref("order")
        .child(uuid())
        .set({
          ...values,
        });
      alert("주문에 성공했습니다.");
      onFinished();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <OderModalPopup className="ani-fadein du-1"
        posx={posx}
        posy={posy}
        style={{ padding: "12px 15px 15px 15px" }}
      >
        <form className="order-form-box" onSubmit={onSubmitOrder}>
          <h4>{OrderItem.name}</h4>
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
            <span className="tit"></span>
            {hotRadio}
          </div>
          {OrderItem.add &&           
          <div className="flex-box a-center">
            <span className="tit">추가</span>
            {OrderItem &&
            <div className="order-check-box">
              <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
              {
                OrderItem.add[0] &&
                  <>
                    <Checkbox value={OrderItem.add[0]}>{OrderItem.add[0]}</Checkbox>
                  </>
              }
              {
                OrderItem.add[1] &&
                  <>
                    <Checkbox value={OrderItem.add[1]}>{OrderItem.add[1]}</Checkbox>
                  </>
              }
              </Checkbox.Group>
            </div>
            }
          </div>          
          }
          <div className="flex-box a-center">
            <span className="tit">기타</span>
            <Input name="etc" type="text" />
          </div>
          <div className="btn-box">
            <Button
              htmlType="submit"
              type="primary"
              style={{ marginRight: "5px" }}
            >
              주문
            </Button>
            <Button onClick={onCancel} type="default">
              취소
            </Button>
          </div>
        </form>
      </OderModalPopup>
    </>
  );
}

export default OrderModal;
