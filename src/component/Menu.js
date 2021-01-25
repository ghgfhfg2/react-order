import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { Button } from "antd";
import { ProdList } from "./Admin/AdminProd";
import OrderModal from "./OrderModal";

function Menu() {
  const [ProdItem, setProdItem] = useState([]);
  useEffect(() => {
    firebase
      .database()
      .ref("products")
      .once("value")
      .then((snapshot) => {
        let array = [];
        snapshot.forEach(function (item) {
          array.push({
            uid: item.key,
            name: item.val().name,
            category: item.val().category,
            image: item.val().image,
            price: item.val().price,
          });
        });
        setProdItem(array);
      });
  }, []);

  const [OnModal, setOnModal] = useState(false);

  const orderHandler = () => {
    setOnModal(true);
  };
  return (
    <>
      <h3 className="title">메뉴판</h3>
      <ProdList>
        {ProdItem.map((item, index) => (
          <div className="list" key={index}>
            <div className="img">
              <img src={item.image} alt="" />
            </div>
            <div className="admin-box">
              <div className="txt">
                <span>{item.name}</span>
                <span>{item.price}</span>
                <span>{item.category}</span>
              </div>
              <div className="admin">
                <Button onClick={orderHandler}>주문하기</Button>
                <Button>장바구니</Button>
              </div>
            </div>
          </div>
        ))}
      </ProdList>
      {OnModal && <OrderModal />}
    </>
  );
}

export default Menu;
