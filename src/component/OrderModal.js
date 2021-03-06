import React, { useEffect, useState } from "react";
import { Button, Input, Checkbox, Spin } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import moment from "moment";
import "moment/locale/ko";
import uuid from "react-uuid";
export const OderModalPopup = styled.div`
  width: auto;
  min-width:290px;
  padding: 20px;
  border: 1px solid #ddd;
  position: fixed;
  z-index: 150;
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s;
  transform: translate(-50%, -70%);
  left: ${(props) => props.posx}px;
  top: ${(props) => props.posy}px;
  box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.25);
  .modal-loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  
  @media all and (max-width: 640px) {
    width: 80%;
    max-width: 300px;
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
  const [UserPhone, setUserPhone] = useState()
  useEffect(() => {
    firebase
    .database()
    .ref(`users/${userInfo.uid}`)
    .once("value")
    .then((snapshot) => {            
      setUserPhone(snapshot.val().call_number)
    });
  }, [])
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
  const [radioValue2, setradioValue2] = useState('저지방');
  const radioChange2 = (e) => {
    setradioValue2(e.target.value);
  };  

  const [AddCheck, setAddCheck] = useState();
  function onChange(checkedValues) {
    setAddCheck(checkedValues);
  }

  const [AddCheck2, setAddCheck2] = useState();
  function onChange2(checkedValues) {
    setAddCheck2(checkedValues);
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
  const [submitLoading, setsubmitLoading] = useState(false);
  const onSubmitOrder = async (e) => {
    setsubmitLoading(true);
    const nowTime = moment().format("YYYY-MM-DD HH:mm:ss|dddd");
    const timeStamp = new Date().getTime();
    e.preventDefault();
    if (e.target.hot) {
      if (!radioValue) {
        alert("온도를 선택해주세요");
        setsubmitLoading(false);
        return;
      }
    }
    let addPrice = 0;

    if (AddCheck2) {
      if (AddCheck2.includes("샷1")) {
        addPrice += 500;
      }
      if (AddCheck2.includes("샷2")) {
        addPrice += 1000;
      }
    }
    if (AddCheck) {
      addPrice += 500;
    }
    let values = {
      order_uid: userInfo.uid,
      order_email: userInfo.email,
      order_name: userInfo.displayName,
      order_part: userInfo.photoURL,
      order_time: nowTime,
      order_etc: e.target.etc.value,
      order_state: 0,
      order_phone:UserPhone,
      prod_name: OrderItem.name,
      prod_img: OrderItem.image,
      price: OrderItem.price * e.target.amount.value + addPrice,
      amount: parseInt(e.target.amount.value),
      kal: parseInt(OrderItem.kal),
      hot: e.target.hot ? e.target.hot.value : "",
      milk: e.target.milk ? e.target.milk.value : "",
      add: AddCheck ? AddCheck : null,
      add2: AddCheck2 ? AddCheck2 : null,
      category: OrderItem.category,
      timestamp: timeStamp,
    };

    try {
      await firebase
        .database()
        .ref("products")
        .child(`${OrderItem.uid}/count`)
        .transaction((pre) => {
          return pre + 1;
        });
      await firebase
        .database()
        .ref("users")
        .child(`${userInfo.uid}/favorite/${OrderItem.name}`)
        .child("count")
        .transaction((pre) => {
          return pre + 1;
        });
      await firebase
        .database()
        .ref("order")
        .child(uuid())
        .set({
          ...values,
        });
      await firebase
        .database()
        .ref("order_count")
        .transaction((pre) => {
          return pre + 1;
        });
      alert("주문에 성공했습니다.");
      onFinished();
      setsubmitLoading(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <OderModalPopup
        className="ani-fadein du-1"
        posx={posx}
        posy={posy}
        style={{ padding: "12px 15px 15px 15px" }}
      >
        <form className="order-form-box" onSubmit={onSubmitOrder}>
          <h4>{OrderItem.name}</h4>
          <div className="flex-box a-center">
            <span className="tit">수량</span>
            {/* <Button
              onClick={minusAmount}
              icon={<MinusOutlined />}
              type="default"
            ></Button> */}
            <Input className="num" name="amount" style={{border:"none"}} value={Amount} />
            {/* <Button
              onClick={plusAmount}
              icon={<PlusOutlined />}
              type="default"
            ></Button> */}
          </div>
          {hotRadio &&
          <div className="flex-box a-center">
            <span className="tit"></span>
            {hotRadio}
          </div>
          }
            {OrderItem.milk &&
            <div className="flex-box a-center">
              <span className="tit"></span>
                    <input
                    type="radio"
                    name="milk"
                    id="basic"
                    value="저지방"
                    defaultChecked
                    onChange={radioChange2}
                    />
                    <label htmlFor="basic">
                    저지방
                    </label>
              {OrderItem.m_soldout && (
                  <>
                  <input
                    type="radio"
                    id="none"
                    name="milk"
                    value="무지방"
                    onChange={radioChange2}
                  />
                  <label htmlFor="none">
                  무지방
                  </label>
                </>
              )}
              {OrderItem.m_soldout2 && (
                <>
                  <input
                    type="radio"
                    id="free"
                    name="milk"
                    value="락토프리"
                    onChange={radioChange2}
                  />
                  <label htmlFor="free">
                  락토프리
                  </label>
                </>
              )}
            </div>
            }
          {OrderItem.add && (
            <div className="flex-box">
              <span className="tit" style={{ marginTop: "3px" }}>
                추가
              </span>
              {OrderItem && (
                <div
                  className="order-check-box"
                  style={{ flexDirection: "column" }}
                >
                  <Checkbox.Group style={{ width: "100%" }} onChange={onChange}>
                    {OrderItem.b_soldout && OrderItem.add.includes("버블") && (
                      <>
                        <Checkbox value="버블">버블</Checkbox>
                      </>
                    )}
                    {!OrderItem.b_soldout && OrderItem.add.includes("버블") && (
                      <>
                        <Checkbox value="버블" disabled>
                          버블품절
                        </Checkbox>
                      </>
                    )}
                  </Checkbox.Group>
                  {OrderItem.add.includes("샷") && (
                    <>
                      <div
                        className="flex-box a-center"
                        style={{ marginTop: "5px" }}
                      >
                        <Checkbox.Group style={{ width: "100%" }} onChange={onChange2}>                          
                          {OrderItem.add.includes("연하게") && (        
                              <Checkbox value="연하게">연하게</Checkbox>
                          )}
                          <Checkbox value="샷1">1샷 추가</Checkbox>
                          <Checkbox value="샷2">2샷 추가</Checkbox>
                        </Checkbox.Group>                        
                      </div>
                    </>
                  )}                  
                </div>
              )}
            </div>
          )}
          <div className="flex-box a-center">
            <span className="tit">기타</span>
            <Input name="etc" type="text" />
          </div>
          <div className="btn-box">
            <Button
              disabled={submitLoading}
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
        {submitLoading && (
          <>
            <div
              className="bg-box"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                background: "rgba(255,255,255,0.5)",
                borderRadius: "10px",
              }}
            ></div>
            <Spin className="modal-loading" tip="Loading..."></Spin>
          </>
        )}
      </OderModalPopup>
    </>
  );
}

export default OrderModal;
