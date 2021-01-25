import React, {useState, useEffect} from 'react'
import { Form, Button, Input, Radio } from 'antd';
import firebase from "../../firebase"
import styled from "styled-components";
import FileLabel from "./ImgUpload"
import uuid from "react-uuid"
export const FileLabel2 = styled.label`
display:flex;width:60px;height:60px;border:1px solid #ddd;
border-radius:5px;flex-shrink:0;justify-content:center;align-items:center;
font-size:12px;color:#888;cursor:pointer;
img{
  max-height:100%;
}
`
const ModalPopup = styled.div`
    width:100%;max-width:500px;padding:20px;border:1px solid #ddd;
    position:fixed;transform:translate(-50%,-50%);left:50%;top:50%;
    z-index:100;border-radius:10px;background:#fff;
`
function ModifyModal({puid,pimg}) {
    const [ItemChange, setItemChange] = useState(0)
    

    const [ProdItem, setProdItem] = useState([])
    useEffect(() => {
        firebase.database().ref("products")
        .child(puid)
        .once('value')
        .then( snapshot => {          
          setProdItem(snapshot.val());
        })    
    
      }, [ItemChange])

    const onSubmitProd2 = async (e) => {      
        e.preventDefault();
        let values = {
            name:e.target.name.value,
            price:e.target.price.value,
            category:e.target.category.value,
        }
        if(isNaN(values.price)){
          alert('가격은 숫자만 입력해 주세요');
          return
        }
        if(ImgFile2){
            var file = ImgFile2;
            var metadata = ImgFile2.type
        }
        try {     
          if (ImgFile2){ 
          let uploadTaskSnapshot = await firebase.storage().ref("products")
          .child(`prod_image/${uuid()}`)
          .put(file,metadata)            
          let downloadURL = await uploadTaskSnapshot.ref.getDownloadURL();          
          await firebase.database().ref("products")
          .child(puid)
          .update({ 
            ...values,
            image: downloadURL 
          })
        }else{         
            let downloadURL = pimg;          
            await firebase.database().ref("products")
            .child(puid)
            .update({ 
                ...values,
                image: downloadURL 
            })
        }
          setItemChange(pre => pre + 1)
          alert('상품을 수정했습니다.')
        }catch(error){
          alert(error)
        }
    }    


    const [ImgFile2, setImgFile2] = useState()
    const [ProdImg2, setProdImg2] = useState()
    const handleChange2 = (e) => {
        
        setImgFile2(e.target.files[0])
        let reader = new FileReader();
        reader.onload = function(event) { 
            setProdImg2(event.target.result); 
        }; 
        reader.readAsDataURL(e.target.files[0]);
        setProdImg2(e.target.files[0])
        }    

    const [radioValue, setradioValue] = useState()
    const radioChange = (e) => {
        setradioValue(e.target.value)
    }    

    if(ProdItem){        
    return (
        <>
           <ModalPopup>
           <form
           className="admin-prod-form" onSubmit={onSubmitProd2}> 
            <input style={{display:"none"}} type="file" id="imgFile2" onChange={handleChange2} />
            <FileLabel2 htmlFor="imgFile2" style={{marginRight:'5px'}}>              
            {ProdImg2 && <img src={`${ProdImg2}`} />}
            {!ProdImg2 && <img src={`${ProdItem.image}`} />}
            </FileLabel2>              
            <input type="radio" id="cate1" name="category" 
                value="a"
                checked={radioValue === 'a'}
                onChange={radioChange}
            />
            <label htmlFor="cate1"></label>
            <input type="radio" id="cate2" name="category" 
                value="b"
                checked={radioValue === 'b'}
                onChange={radioChange}
            />
            <label htmlFor="cate2"></label>
            <input type="radio" id="cate3" name="category" 
                value="c"
                checked={radioValue === 'c'}
                onChange={radioChange}
            />
            <label htmlFor="cate3"></label>            
            <input type="text" name="name" defaultValue={ProdItem.name} />
            <input type="text" name="price" defaultValue={ProdItem.price} />            
            <Button htmlType="submit" type="primary" size="large">
                등록
            </Button>
            </form>
           </ModalPopup> 
        </>
    )
}
}

export default ModifyModal
