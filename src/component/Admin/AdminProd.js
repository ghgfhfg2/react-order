import React,{useState, useEffect} from "react";
import ImgUpload from "./ImgUpload"
import { Form, Button, Input, Radio } from 'antd';
import firebase from "../../firebase"
import styled from "styled-components";
import ModifyModal from "./ModifyModal"
import uuid from "react-uuid"

const ProdList = styled.div`
  display:flex;flex-wrap:wrap;
  .list{
    margin:5px;width:calc(25% - 10px);border:1px solid #ddd;
    display:flex;align-items:center;justify-content:space-between;
    .img img{height:80px;width:80px;}
    .txt{display:flex;flex-direction:column;padding-right:10px;text-align:right}
    .admin{display:flex;flex-direction:column;padding-right:10px;
      button{margin:2px 0}
    }
    .admin-box{display:flex;align-items:center;}
  }
`

function AdminProd() {

  const [ItemChange, setItemChange] = useState(0)
  const [ProdItem, setProdItem] = useState([])
  useEffect(() => {
    firebase.database().ref("products")
    .once('value')
    .then( snapshot => {
      let array = []
      snapshot.forEach(function(item) {
        array.push({  
          uid:item.key,   
          name: item.val().name,
          category: item.val().category,
          image: item.val().image,
          price: item.val().price,
        });
      });
      setProdItem(array);
      console.log(array)
    })    

  }, [ItemChange])

  const [ImgFile, setImgFile] = useState()
  const onImgFile = (e) => {
    setImgFile(e.target.files[0])
  }

  // submit 
  const onSubmitProd = async (values) => {      
      if(isNaN(values.price)){
        alert('가격은 숫자만 입력해 주세요');
        return
      }
      if(!ImgFile){
        alert('이미지를 올려주세요')
        return
      }
      const file = ImgFile;
      const metadata = ImgFile.type
      try {      
        
        let uploadTaskSnapshot = await firebase.storage().ref()
        .child(`prod_image/${uuid()}`)
        .put(file,metadata)
        let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();

        await firebase.database().ref("products")
        .child(uuid())
        .set({ 
          ...values,
          image: downloadURL,
        })
        setItemChange(pre => pre + 1)
        alert('상품을 등록했습니다.')
      }catch(error){
        alert(error)
      }
  }


  // 모달팝업 호출
  const [Puid, setPuid] = useState()
  const [Pimg, setPimg] = useState()
  const [OnModal, setOnModal] = useState(false)
  const onProdModify = (uid,img) => {
    setPuid(uid)
    setPimg(img)
    setOnModal(true)
  }

  const onProdDelete = async(uid) => {
    try { 
      await firebase.database().ref("products")
      .child(uid)
      .remove()
      setItemChange(pre => pre + 1)
      alert('상품을 삭제했습니다.')
    }catch(error){
      alert(error)
    }
  }

  return (
    <>    
        <h3 className="title">상품등록</h3>
        <Form className="admin-prod-form" onFinish={onSubmitProd}>     
          <div className="ant-row ant-form-item ant-form-item-has-success" style={{alignItems:"center"}}> 
            <div className="ant-col ant-form-item-label"><label htmlFor="category" className="ant-form-item-required">이미지</label></div>    
            <ImgUpload onImgFile={onImgFile} />              
          </div>
          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해 주세요' }]}
          >
            <Radio.Group>
              <Radio.Button value="a">item 1</Radio.Button>
              <Radio.Button value="b">item 2</Radio.Button>
              <Radio.Button value="c">item 3</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="name"
            label="상품명"
            rules={[
              {
                required: true,
                message: '상품명을 입력해 주세요',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="가격"
            rules={[
              {
                required: true,
                message: '가격을 입력해 주세요',
              },
            ]}
          >
            <Input className="sm-input" type="text" />
          </Form.Item>
          <Button htmlType="submit" type="primary" size="large">
            등록
          </Button>
        </Form>
        <ProdList>
          {
            ProdItem.map((item,index) => (
              <div className="list" key={index}>
                <div className="img">
                  <img src={item.image} />
                </div>
                <div className="admin-box">
                  <div className="txt">
                    <span>{item.name}</span>
                    <span>{item.price}</span>
                    <span>{item.category}</span>
                  </div>
                  <div className="admin">
                  <Button onClick={() => onProdModify(item.uid, item.image)}>수정</Button>  
                  <Button onClick={() => onProdDelete(item.uid)}>삭제</Button>  
                  </div> 
                </div>             
              </div>
            ))
          }
        </ProdList>
        {
          OnModal &&
          <ModifyModal puid={Puid} pimg={Pimg} />
        }
    </>
  )
}

export default AdminProd;
