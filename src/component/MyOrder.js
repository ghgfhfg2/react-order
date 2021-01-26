import { Button } from "antd";
import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { Popover } from "antd";
import { commaNumber } from "./CommonFunc";
import { useSelector } from "react-redux";
import { OrderBox } from "./Admin/AdminOrder";

function MyOrder() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    firebase
      .database()
      .ref("order")
      .orderByChild("order_uid")
      .equalTo(userInfo.uid)
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
          if (a.timestamp < b.timestamp) {
            return 1;
          }
          if (a.timestamp > b.timestamp) {
            return -1;
          }
        });
        setOrderList(array);
      });
  }, []);

  return (
    <>
      <h3 className="title">주문내역</h3>
      <OrderBox>
        {OrderList.map((list, index) => (
          <div className="list" key={index}>
            <span style={{ display: "none" }}>{list.key}</span>
            <div className="prod">
              <div className="info-box">
                <span className="info">{list.prod_name}</span>
                <span className="info">{list.hot}</span>
                <span className="info">{list.amount}</span>
                {list.order_etc && (
                  <Popover content={list.order_etc} trigger="click">
                    <Button type="default">기타</Button>
                  </Popover>
                )}
              </div>
              <span>{commaNumber(list.price)}원</span>
            </div>
            <div className="state">
              <span>{list.order_time}</span>
              <span>{list.order_state === 0 ? "대기중" : "완료"}</span>
            </div>
          </div>
        ))}
      </OrderBox>
    </>
  );
}

export default MyOrder;
