import React, { useState, useEffect } from "react";
import { Button } from "antd";
import styled from "styled-components";
import firebase from "../../firebase";
import { Popover, Radio } from "antd";
import { commaNumber } from "../CommonFunc";
import { Howl } from "howler";
import src1 from "../../jumun.mp3";
import src2 from "../../jumun2.mp3";
import src3 from "../../jumun3.mp3";
import src4 from "../../jumun4.mp3";
import src5 from "../../pling.mp3";
import src6 from "../../dding.mp3";
import src7 from "../../alert.mp3";

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
    &.state_1{
      .ic-hot,
      .ic-ice {
        opacity: 1;
      }
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
  const [SoundSelect, setSoundSelect] = useState();
  useEffect(() => {
    firebase
      .database()
      .ref("order_sound")
      .child("sound")
      .once("value")
      .then((snapshot) => {
        setSoundSelect(snapshot.val());
      });
  }, []);
  const onSoundChange = (e) => {
    setSoundSelect(e.target.value);
    firebase.database().ref("order_sound").update({ sound: e.target.value });
  };

  const Sound = new Howl({
    src: [SoundSelect],
  });

  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    let mounted = true;
    if (mounted) {
        firebase
        .database()
        .ref("order")
        .orderByChild("order_state")
        .endAt(1)
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
      }
    return function cleanup() {
      firebase.database().ref("order").off();
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("order_count")
        .on("value", (snapshot) => {
          Sound.play();
        });
    }
    return function cleanup() {
      firebase.database().ref("order_count").off();
      mounted = false;
    };
  }, [SoundSelect]);

  const stateChange = (key) => {
      firebase.database().ref(`order/${key}`)
      .child("order_state")
      .transaction((pre) => {
        return pre + 1;
      });
  };
  const stateChange2 = (key) => {
    if (window.confirm("완료하시겠습니까?")) {
      firebase.database().ref(`order/${key}`)
      .child("order_state")
      .transaction((pre) => {
        return pre + 1;
      });
    }
  };
  return (
    <>
      <h3 className="title">주문관리</h3>
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={onSoundChange} value={SoundSelect}>
          <Radio.Button value={src1}>주문-여자</Radio.Button>
          <Radio.Button value={src2}>주문-남자</Radio.Button>
          <Radio.Button value={src3}>주문-여자아이</Radio.Button>
          <Radio.Button value={src4}>주문-남자아이</Radio.Button>
          <Radio.Button value={src5}>효과음1</Radio.Button>
          <Radio.Button value={src6}>효과음2</Radio.Button>
          <Radio.Button value={src7}>효과음3</Radio.Button>
        </Radio.Group>
      </div>
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
                    <span className="info">{list.add}</span>
                    <span className="info">{list.add2}</span>
                  </>
                )}
                {list.order_etc && (
                  <Popover content={list.order_etc} trigger="click">
                    <Button type="default">기타</Button>
                  </Popover>
                )}
              </div>
              <span>{commaNumber(parseInt(list.price))}원</span>
            </div>
            <div className="state">
              <span className="date">
                {list.order_time}
              </span>
              {list.order_state === 0 &&
              <Button
                onClick={() => {
                  stateChange(list.key);
                }}
              >
                주문접수
              </Button>
              }
              {list.order_state === 1 &&
              <Button
                onClick={() => {
                  stateChange2(list.key);
                }}
              >
                완료처리
              </Button>
              }
            </div>
          </div>
        ))}
      </OrderBox>
    </>
  );
}

export default AdminOrder;
