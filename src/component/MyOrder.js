import { Button } from "antd";
import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { Popover } from "antd";
import { commaNumber } from "./CommonFunc";
import { useSelector } from "react-redux";
import { OrderBox } from "./Admin/AdminOrder";
import Loading from "./Loading";
import { Empty } from "antd";

function MyOrder() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [OrderList, setOrderList] = useState([]);
  const [Nodata, setNodata] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      firebase
        .database()
        .ref("order")
        .orderByChild("order_uid")
        .equalTo(userInfo.uid)
        .limitToFirst(30)
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
          if (array.length === 0) {
            setNodata(true);
          }
          notify()
        });
    }
    return function cleanup() {
      firebase.database().ref("order").off();
      mounted = false;
    };
  }, []);

  const orderCancel = (key) => {
    console.log(key)
    if (window.confirm("주문 취소 하시겠습니까?")) {
    firebase.database().ref("order").child(key).remove()
    }
  }

  const getNotificationPermission = () => {
    // 브라우저 지원 여부 체크
    if (!("Notification" in window)) {
        alert("데스크톱 알림을 지원하지 않는 브라우저입니다.");
    }
    // 데스크탑 알림 권한 요청
    Notification.requestPermission(function (result) {
        // 권한 거절
        if(result == 'denied') {
            alert('알림을 차단하셨습니다.\n브라우저의 사이트 설정에서 변경하실 수 있습니다.');
            return false;
        }
    });
}
getNotificationPermission()
// 알림 띄우기
function notify() {
  var options = {
      body: "주문상태가 변경되었습니다."
  }
  var notification = new Notification("주문알림", options);
  
  setTimeout(function(){
      notification.close();
  }, 3000);
}


  if (OrderList.length) {
    return (
      <>
        <h3 className="title">주문내역</h3>
        <OrderBox>
          {OrderList.map((list, index) => (
            <div className={`list state_${list.order_state}`} key={index}>
              <div className="prod">
                <div className="info-box">
                  <span className="info">{list.prod_name}</span>
                  {list.hot === "hot" ? (
                    <span className="ic-hot shrink-0"></span>
                  ) : list.hot === "ice" ? (
                    <span className="ic-ice shrink-0"></span>
                  ) : (
                    ""
                  )}
                  <span className="info shrink-0">{list.amount}개</span>
                  <div>
                    {list.add && (
                      <span className="info shrink-0">{list.add}</span>
                    )}
                    {list.add2 && (
                      <span className="info shrink-0">{list.add2}</span>
                    )}
                  </div>
                  {list.order_etc && (
                    <Popover content={list.order_etc} trigger="click">
                      <Button type="default">기타</Button>
                    </Popover>
                  )}
                </div>
                <span className="shrink-0">{commaNumber(parseInt(list.price))}원</span>
              </div>
              <div className="state">
                <span className="date">
                  {list.order_time.split("|")[0]}&nbsp; (
                  {list.order_time.split("|")[1]})
                </span>
                <span>
                  {list.order_state === 0 &&
                  <>
                    <Button
                      style={{marginRight:"5px"}}
                      onClick={() => {
                        orderCancel(list.key);
                      }}
                    >
                      주문취소
                    </Button>
                    대기중
                    </>
                    }
                  {list.order_state === 1 && "주문접수"}
                  {list.order_state === 2 && "완료"}
                </span>
              </div>
            </div>
          ))}
        </OrderBox>
      </>
    );
  } else if (Nodata) {
    return (
      <>
        <Empty
          description="주문내역이 없습니다."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        ></Empty>
      </>
    );
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
}

export default MyOrder;
