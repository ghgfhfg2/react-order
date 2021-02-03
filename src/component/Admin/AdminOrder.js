import React, { useState, useEffect } from "react";
import { Button } from "antd";
import styled from "styled-components";
import firebase from "../../firebase";
import { Popover } from "antd";
import { commaNumber } from "../CommonFunc";
import { Howl } from "howler";
import src from "../../jumun.mp3";

export const OrderBox = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  .list {
    .ic-hot,
    .ic-ice {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      opacity: 0.4;
      margin-right: 10px;
      position: relative;
      top: 1px;
    }
    .ic-hot {
      background: #f02424;
    }
    .ic-ice {
      background: #1890ff;
    }
    color: #888;
    &.state_0 {
      .ic-hot,
      .ic-ice {
        opacity: 0.85;
      }
      color: #555;
      border-color: #e6f7ff;
      animation: neon_blue 1.5s ease-in-out infinite alternate;
      .info {
        color: #111;
        font-weight: 500;
      }
    }
    .from {
      border-bottom: 1px solid #ddd;
      height: 30px;
    }
    diplay: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: calc(33.33% - 10px);
    margin: 5px;
    .from {
      margin-bottom: 5px;
    }
    .date {
      font-size: 12px;
    }
    .info-box {
      display: flex;
      align-items: center;
      height: 28px;
      .info {
        margin-right: 7px;
      }
      .ant-btn {
        height: 28px;
        padding: 0 7px;
        line-height: 1;
        span {
          height: 100%;
          line-height: 28px;
          font-size: 12px;
        }
      }
    }
    & > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 4px;
    }
  }
  @media all and (max-width: 1024px) {
    .list {
      width: calc(50% - 10px);
    }
  }
  @media all and (max-width: 640px) {
    .list {
      width: 100%;
      margin: 5px 0;
    }
  }
`;

function AdminOrder() {
  const jumunSrc = src;
  const Sound = new Howl({
    src: [jumunSrc],
  });

  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("order")
        .orderByChild("order_state")
        .equalTo(0)
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
          Sound.play();
        });
    }
    return function cleanup() {
      mounted = false;
    };
  }, []);

  const stateChange = (key) => {
    if (window.confirm("완료하시겠습니까?")) {
      firebase.database().ref("order").child(key).update({
        order_state: 1,
      });
    }
  };

  return (
    <>
      <h3 className="title">주문관리</h3>
      <OrderBox>
        {OrderList.map((list, index) => (
          <div className={`list state_${list.order_state}`} key={index}>
            <span style={{ display: "none" }}>{list.key}</span>
            <div className="from">
              <span>{list.order_name}</span>
              <span>{list.order_part}</span>
            </div>
            <div className="prod">
              <div className="info-box">
                <span className="info">{list.prod_name}</span>
                {list.hot === "hot" ? (
                  <span className="ic-hot"></span>
                ) : list.hot === "ice" ? (
                  <span className="ic-ice"></span>
                ) : (
                  ""
                )}
                <span className="info">{list.amount}개</span>
                {list.add && (
                  <>
                    <span className="info">{list.add[0]}</span>
                    <span className="info">{list.add[1]}</span>
                  </>
                )}
                {list.order_etc && (
                  <Popover content={list.order_etc} trigger="click">
                    <Button type="default">기타</Button>
                  </Popover>
                )}
              </div>
              <span>{commaNumber(list.price)}원</span>
            </div>
            <div className="state">
              <span className="date">
                {list.order_time.split("|")[0]}&nbsp; (
                {list.order_time.split("|")[1]})
              </span>
              <Button
                onClick={() => {
                  stateChange(list.key);
                }}
              >
                완료처리
              </Button>
            </div>
          </div>
        ))}
      </OrderBox>
    </>
  );
}

export default AdminOrder;
