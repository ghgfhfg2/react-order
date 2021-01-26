import { Button } from "antd";
import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Popover } from "antd";
import { commaNumber } from "../CommonFunc";
import { OrderBox } from "./AdminOrder";

function AdminOrderList() {
  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    firebase
      .database()
      .ref("order")
      .orderByChild("order_state")
      .equalTo(1)
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
            return 1;
          }
          if (a.timestamp < b.timestamp) {
            return -1;
          }
        });
        setOrderList(array);
      });
  }, []);

  return (
    <>
      <h3 className="title">완료내역</h3>

      <OrderBox>
        {OrderList.map((list, index) => (
          <div className="list" key={index}>
            <span style={{ display: "none" }}>{list.key}</span>
            <div className="from">
              <span>{list.order_name}</span>
              <span>{list.order_part}</span>
            </div>
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
          </div>
        ))}
      </OrderBox>
    </>
  );
}

export default AdminOrderList;
