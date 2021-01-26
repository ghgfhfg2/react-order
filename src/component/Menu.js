import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { Button } from "antd";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";

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
            kal: item.val().kal,
            hot: item.val().hot,
            category: item.val().category,
            image: item.val().image,
            price: item.val().price,
          });
        });
        setProdItem(array);
      });
  }, []);

  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const [OnModal, setOnModal] = useState(false);
  const [OrderItem, setOrderItem] = useState()
  const orderHandler = (e, item) => {
    setOrderItem(item)
    setPosX(e.clientX);
    setPosY(e.clientY);
    setOnModal(true);
  };
  const onFinished = () => {
    setOnModal(false)
  }
  return (
    <>
      <h3 className="title">메뉴판</h3>
      <ProdList>
        {ProdItem.map((item, index) => (
          <div className="list" key={index}>
            <div className="img">
              <span className="kal">{item.kal}kal</span>
              <img src={item.image} alt="" />
            </div>
            <div className="admin-box">
             <div className="txt">
                <span>{item.name}</span>
                <div className="flex-box between">
                <span>{item.hot}</span>
                <span>{item.price}원</span>
                </div>
              </div>
              <div className="admin">
                <Button onClick={(e) => orderHandler(e, item)}>주문하기</Button>
              </div>
            </div>
          </div>
        ))}
      </ProdList>
      {OnModal && <OderModalPopup onFinished={onFinished} posx={PosX}
          posy={PosY} OrderItem={OrderItem} />}
    </>
  );
}

export default Menu;
