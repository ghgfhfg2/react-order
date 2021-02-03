import React, { useState, useEffect } from "react";
import firebase from "../../firebase";
import { Table } from "antd";

function AdminOrderList() {
  const [OrderList, setOrderList] = useState([]);
  useEffect(() => {
    let mounted = true;
    if(mounted){
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
    }
    return function cleanup() {
      mounted = false
    }
  }, []);

  const columns = [
    {
      title: '주문자',
      dataIndex: 'order_name',
      key: 'order_name',
      sorter: {
        compare: (a, b) => a.order_name - b.order_name,
        multiple: 1,
      },
      align:'center'
    },
    {
      title: '상품명',
      dataIndex: 'prod_name',
      key: 'prod_name',
      align:'center'
    },
    {
      title: '수량',
      dataIndex: 'amount',
      key: 'amount',
      align:'center'
    },
    {
      title: '온도',
      dataIndex: 'hot',
      key: 'hot',
      align:'center'
    },
    {
      title: '코멘트',
      dataIndex: 'etc',
      key: 'etc',
      align:'center'
    },
    {
      title: '주문시간',
      dataIndex: 'order_time',
      key: 'order_time',
      sorter: {
        compare: (a, b) => a.timestamp - b.timestamp,
        multiple: 3,
      },
      align:'center'
    },
    {
      title: '가격',
      dataIndex: 'price',
      key: 'price',
      sorter: {
        compare: (a, b) => a.price - b.price,
        multiple: 4,
      },
      align:'center'
    },
  ];
  return (
    <>
      <h3 className="title">완료내역</h3>
      <table class="fl-table">
        <thead>
          <tr>
            <th scope="col">주문자</th>
            <th scope="col">상품명</th>
            <th scope="col">수량</th>
            <th scope="col">코멘트</th>
            <th scope="col">주문시간</th>
            <th scope="col">가격</th>
          </tr>
        </thead>
        <tbody>
          {
          OrderList.map((list,index) => (
          <tr key={index}>
            <td>{list.order_name}</td>
            <td>{
              list.hot === 'hot' && "따뜻한 "
            }
            {
              list.hot === 'ice' && "차가운 "
            }
            {list.prod_name}
            {list.hot}
            </td>
            <td>{list.amount}</td>
            <td>{list.order_etc}</td>
            <td>{list.order_time}</td>
            <td>{list.price}</td>
          </tr>
          ))
          }
        </tbody>
      </table>



      {/* <Table dataSource={OrderList} columns={columns} pagination={false} 
      /> */}
     
    </>
  );
}

export default AdminOrderList;
