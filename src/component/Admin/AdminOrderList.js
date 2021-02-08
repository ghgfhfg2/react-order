import React, { useState, useEffect } from "react";
import firebase from "../../firebase";

function AdminOrderList() {
  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    let mounted = true;
    if (mounted) {
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
              return -1;
            }
            if (a.timestamp < b.timestamp) {
              return 1;
            }
          });
          array = array.slice(0, 250);
          setOrderList(array);
        });
    }
    return function cleanup() {
      firebase.database().ref("order").off();
      mounted = false;
    };
  }, []);

  return (
    <>
      <h3 className="title">완료내역</h3>
      <table className="fl-table">
        <thead>
          <tr>
            <th scope="col">주문자</th>
            <th scope="col">상품명</th>
            <th scope="col">수량</th>
            <th scope="col">추가</th>
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
                {list.hot}
              </td>
              <td>{list.amount}</td>
              <td>{list.add} {list.add2}</td>
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
