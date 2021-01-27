import React, { useState, useEffect } from "react";
import ImgUpload from "./ImgUpload";
import { Form, Button, Input, Radio } from "antd";
import firebase from "../../firebase";
import styled from "styled-components";
import ModifyModal from "./ModifyModal";
import uuid from "react-uuid";

export const ProdList = styled.div`
  display: flex;
  flex-wrap: wrap;
  .list {
    margin: 10px 8px;width: calc(12.5% - 16px);display: flex;
    flex-direction:column;justify-content: space-between;border-radius: 7px;
    box-shadow: 0px 0px 4px 0px rgba(0,0,0,0.25);overflow: hidden;
    transition:all 0.2s;
    &:hover{box-shadow: 0px 0px 7px 1px rgba(0,0,0,0.3);}
    .img {
      height: 0;
      border-top-left-radius:7px;
      border-top-right-radius:7px;
      overflow:hidden;
      width: 100%;
      padding-bottom:75%;
      overflow: hidden;position:relative;
      img {
        height:100%;
        position:absolute;left:50%;top:50%;
        transform:translate(-50%,-50%);
      }
      .kal{position: absolute;left: 0;top: 0;background: rgba(255,255,255,0.85);display: inline-block;z-index: 1;padding: 3px 6px;font-size: 12px;border-bottom-right-radius: 5px;}
    }
    .txt {
      display: flex;width:100%;
      flex-direction: column;margin-bottom:5px;
      .name{font-weight:bold;font-size:15px}
    }
    .hot{font-size:13px;}
    .price{font-size:13px;color:#1672c9;}
    .admin {
      display: flex;
      button {
        margin: 2px;
      }
    }
    .admin-box {
      display: flex;flex-direction:column;
      align-items: center;padding:7px;
    }
  }
  @media all and (max-width: 1400px) {
    .list {
      width: calc(20% - 10px);
    }
  }
  @media all and (max-width: 1024px) {
    .list {
      width: calc(33.33% - 10px);
    }
  }
  @media all and (max-width: 640px) {
    .list {
      width: calc(50% - 10px);
    }
  }
`;

function AdminProd() {
  const [ItemChange, setItemChange] = useState(0);
  const [ProdItem, setProdItem] = useState([]);
  useEffect(() => {
    let mounted = true;
    if(mounted){
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
    }
      return function cleanup() {
        mounted = false
      }
  }, [ItemChange]);

  const [ImgFile, setImgFile] = useState();
  const onImgFile = (e) => {
    setImgFile(e.target.files[0]);
  };

  // submit
  const onSubmitProd = async (values) => {
    if (isNaN(values.price)) {
      alert("가격은 숫자만 입력해 주세요");
      return;
    }
    if (!ImgFile) {
      alert("이미지를 올려주세요");
      return;
    }
    const file = ImgFile;
    const metadata = ImgFile.type;
    try {
      let uploadTaskSnapshot = await firebase
        .storage()
        .ref("products")
        .child(`prod_image/${uuid()}`)
        .put(file, metadata);
      let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

      await firebase
        .database()
        .ref("products")
        .child(uuid())
        .set({
          ...values,
          image: downloadURL,
        });
      setItemChange((pre) => pre + 1);
      alert("상품을 등록했습니다.");
    } catch (error) {
      alert(error);
    }
  };

  // 모달팝업 호출
  const [Puid, setPuid] = useState();
  const [Pimg, setPimg] = useState();
  const [OnModal, setOnModal] = useState(false);
  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const onProdModify = (e, uid, img) => {
    setPosX(e.clientX);
    setPosY(e.clientY);
    setPuid(uid);
    setPimg(img);
    setOnModal(true);
  };

  const onProdDelete = async (uid) => {
    const delConfirm = window.confirm("삭제하시겠습니까?");
    try {
      if (delConfirm) {
        await firebase.database().ref("products").child(uid).remove();
        setItemChange((pre) => pre + 1);
        alert("상품을 삭제했습니다.");
      }
    } catch (error) {
      alert(error);
    }
  };

  const onFinished = () => {
    setOnModal(false);
    setItemChange((pre) => pre + 1);
  };

  return (
    <>
      <h3 className="title">상품등록</h3>
      <Form className="admin-prod-form" onFinish={onSubmitProd}>
        <div
          className="ant-row ant-form-item ant-form-item-has-success"
          style={{ alignItems: "center" }}
        >
          <div className="ant-col ant-form-item-label">
            <label htmlFor="category" className="ant-form-item-required">
              이미지
            </label>
          </div>
          <ImgUpload onImgFile={onImgFile} />
        </div>
        <Form.Item
          name="category"
          label="카테고리"
          rules={[{ required: true, message: "카테고리를 선택해 주세요" }]}
        >
          <Radio.Group>
            <Radio.Button value="커피">커피</Radio.Button>
            <Radio.Button value="라떼">라떼</Radio.Button>
            <Radio.Button value="에이드">에이드</Radio.Button>
            <Radio.Button value="차">차</Radio.Button>
            <Radio.Button value="프로틴">프로틴</Radio.Button>
            <Radio.Button value="스낵">스낵</Radio.Button>
            <Radio.Button value="주스">주스</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="name"
          label="상품명"
          rules={[
            {
              required: true,
              message: "상품명을 입력해 주세요",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="hot"
          label="온도"
          rules={[{ required: true, message: "온도를 선택해 주세요" }]}
        >
          <Radio.Group>
            <Radio.Button value="hot & ice">hot & ice</Radio.Button>
            <Radio.Button value="hot only">hot only</Radio.Button>
            <Radio.Button value="ice only">ice only</Radio.Button>
            <Radio.Button value="etc">etc</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="kal"
          label="칼로리"
          rules={[
            {
              required: true,
              message: "칼로리를 입력해 주세요",
            },
          ]}
        >
          <Input className="sm-input" />
        </Form.Item>
        <Form.Item
          name="price"
          label="가격"
          rules={[
            {
              required: true,
              message: "가격을 입력해 주세요",
            },
          ]}
        >
          <Input className="sm-input" type="text" />
        </Form.Item>
        <Button htmlType="submit" type="primary" size="large">
          등록하기
        </Button>
      </Form>
      <ProdList style={{marginTop:"20px"}}>
        {ProdItem.map((item, index) => (
          <div className="list" key={index}>
            <div className="img">
              <span className="kal">{item.kal}kal</span>
              <img src={item.image} alt="" />
            </div>
            <div className="admin-box">
              <div className="txt">
                <span className="name">{item.name}</span>
                <div className="flex-box between">
                <span className="hot">{item.hot}</span>
                <span className="price">{item.price}원</span>
                </div>
              </div>
              <div className="admin">
                <Button onClick={(e) => onProdModify(e, item.uid, item.image)}>
                  수정
                </Button>
                <Button onClick={() => onProdDelete(item.uid)}>삭제</Button>
              </div>
            </div>
          </div>
        ))}
      </ProdList>
      {OnModal && (
        <ModifyModal
          puid={Puid}
          pimg={Pimg}
          onFinished={onFinished}
          posx={PosX}
          posy={PosY}
        />
      )}
    </>
  );
}

export default AdminProd;
