import React,{useEffect,useState} from 'react';
import firebase, {wel} from "../../firebase";
import { useSelector } from "react-redux";
import { Popover, Popconfirm, message, Button, DatePicker, Statistic } from 'antd';
import * as antIcon from "react-icons/ai";
import { getFormatDate } from '../CommonFunc';
import moment from 'moment';
const { Countdown } = Statistic;

function Chair() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const welDb = firebase.database(wel);
  const [CurDate, setCurDate] = useState(getFormatDate(new Date()))
  const [TimeData, setTimeData] = useState();

  const timeTable = (time,chair) => {
    const first = new Date(SearchDate.year,SearchDate.og_month,SearchDate.og_day,8,30);
    const last = new Date(SearchDate.year,SearchDate.og_month,SearchDate.og_day,18,0);
    let timeArr = [];
    let copy = timeArr.concat()
    let n = 0;
    let chairArr = [];
    for(let i=1;i<=chair;i++){
      chairArr.push({
        room_num:i
      })
    }
    while(first.getTime() < last.getTime()){
      let obj = {
        timeNum:n+1,
        time:getFormatDate(first),
        room:chairArr
      }
      first.setMinutes(first.getMinutes()+time)
      timeArr.push(obj);
      n++;
    }    
    return timeArr;
  }
  
  const [Rerender, setRerender] = useState(false);
  const onRerender = () => {
    setRerender(!Rerender);
  }
  const [ListData, setListData] = useState()
 
  const getListOff = () => {
    welDb.ref(`chair/list/${CurDate.full}`).off()
  }

  useEffect(() => {
    setInterval(() => {
      setCurDate(getFormatDate(new Date()))
    }, 2000);
    return () => {
    }
  }, [])
  
  const [SearchDate, setSearchDate] = useState(CurDate)

  const [MyReservation, setMyReservation] = useState()
  useEffect(() => {
    // 사용자 목록
    welDb.ref(`chair/user/${userInfo.uid}/list`)
    .on('value', data => {
      let userArr = [];
      data.forEach(el=>{
        for(let i in el.val()){
          if(el.val()[i].reserve_time > CurDate.timestamp){
            let room = el.val()[i].room === 'room1' ? <antIcon.AiOutlineMan /> :
                       el.val()[i].room === 'room2' ? <antIcon.AiOutlineWoman /> : <antIcon.AiOutlineUser />
            let obj = {
              date: getFormatDate(new Date(el.val()[i].reserve_time)),
              timestamp: el.val()[i].timestamp,
              timeNum: el.val()[i].timeNum,
              room: room
            }
            userArr.push(obj)
          }
        }        
      })
      setMyReservation(userArr)
    })

    // 예약목록
    let arr = [];
    welDb.ref(`chair/list/${SearchDate.full}`)
    .on('value', data => {
      let timeArr = timeTable(30,3); //시간표 생성
      let arr2 = JSON.parse(JSON.stringify(timeArr));
      data.forEach(el=>{
        arr.push(el.val())
      });
      timeArr.map((time,idx)=>{
        arr.map(user=>{
          if(user.timeNum === time.timeNum){
            for(let key in user){ 
              if(key != 'timeNum' && user[key]){                
                arr2[idx][key] = user[key]
                
                arr2[idx][key] = user[key]
                arr2[idx].room[user[key].room-1] = {
                  ...arr2[idx].room[user[key].room-1],
                  num: 'room'+user[key].room,
                  check:true
                }
              }
            }
          }
        })
      })
      console.log(arr2)
      setListData(arr2)
    })
    
    return () => {
      getListOff()
    }
  }, [Rerender])


  const reservation = (num,time,chair) => {
    let room = 'room'+chair;
    const user = {
      name: userInfo.displayName,
      part: userInfo.photoURL,
      user_uid: userInfo.uid,
      room: chair  
    }

    welDb.ref(`chair/user/${userInfo.uid}/list/${SearchDate.full}`)
    .get()
    .then(data=>{
      if (data.exists()) {
        message.error('예약은 하루에 한건만 가능합니다.');
      }else{
        
            // 예약 목록
            welDb.ref(`chair/list/${SearchDate.full}/${num}`)
            .update({
              [room]:user,
              timeNum: num
            })
        
            // 사용자 예약목록
            welDb.ref(`chair/user/${userInfo.uid}/list/${SearchDate.full}/${num}`)
            .update({
              reserve_time:time.timestamp,
              timestamp:new Date().getTime(),
              timeNum: num,
              room
            })
        
            // 카운팅
            welDb.ref(`chair/user/${userInfo.uid}/count`)
            .transaction((pre) => {
              pre++
              return pre;
            });
            message.success('예약 되었습니다.');
      }
    })
  }

  const onCancel = (num) => {      
      welDb.ref(`chair/list/${SearchDate.full}/${num}`).remove();
      welDb.ref(`chair/user/${userInfo.uid}/list/${SearchDate.full}/${num}`).remove();
      welDb.ref(`chair/user/${userInfo.uid}/count`)
      .transaction((pre) => {
        pre--
        return pre;
      });
      message.success('취소 되었습니다.');
      setRerender(!Rerender)
  }

  // 날짜선택
  const onSelectDate = (date, dateString) => {
    setSearchDate(getFormatDate(date._d));
    setRerender(!Rerender)
  }

  return (
    <>
      <div className="flex-box a-center" style={{marginBottom:"20px"}}>
      <h3 className="title" style={{marginRight:"10px"}}>날짜선택</h3>
        <DatePicker 
          format="YYYY-MM-DD"
          defaultValue={moment()}
          style={{marginBottom:"10px"}}
          onChange={onSelectDate} 
        />
      </div>
      {MyReservation && MyReservation.length > 0 &&
        <>
          <h3 className="title">예정중인 내 예약목록</h3>
          <ul className="my-reserv-list">
          {MyReservation.map((el,idx)=>(
            <li key={idx}>
              <div className="box">
                <div className="r-day">
                  <span className="room">{el.room}</span>
                  <span className="date fon-barlow">{el.date.full_} {el.date.hour}:{el.date.min}</span>
                </div>
                <div className="right">
                  <div className="count-box">
                    <antIcon.AiOutlineHourglass className="ic-time" />
                    <Countdown 
                      className="countdown"
                      value={el.date.timestamp}
                      format="H시간 m분 s초"
                      onFinish={onRerender}
                    />
                  </div>
                  <Popconfirm
                    title="예약 취소 하시겠습니까?"
                    onConfirm={()=>{onCancel(el.timeNum)}}
                  >                  
                    <Button className="btn-del"><antIcon.AiOutlineRollback /><span className="no-mo">예약취소</span></Button>
                  </Popconfirm>
                </div>
              </div>
            </li>
          ))}
          </ul>
        </>
      }
      {ListData &&
        <>
          <h3 className="title" style={{marginTop:"25px"}}>예약하기</h3>
          <ul className="flex-box reserv-info">
            <li>
              <antIcon.AiOutlineMan /> 남자전용
            </li>
            <li>
              <antIcon.AiOutlineWoman /> 여자전용
            </li>
            <li>
              <antIcon.AiOutlineUser /> 남여공용
            </li>
            <li>
              <antIcon.AiOutlineBell /> 예약중
            </li>
          </ul>
          <ul className="chair-time-list">
          {ListData.map((el,idx)=>(
            <li 
              key={idx} 
              className={
                el.time.timestamp > CurDate.timestamp &&
                el.user && el.user.user_uid === userInfo.uid ? 'my-reserve' :
                el.time.timestamp > CurDate.timestamp && el.user ? 'reserv' :
                el.time.timestamp < CurDate.timestamp ? 'timeover' : ''
              }
            >
              <div className="box">
                <span className="time fon-barlow">{el.time.hour}:{el.time.min}</span>
                <div className="btn-box">
                {
                  el.room.map(list=>(
                    <>                    
                    <Popconfirm
                      title={`${list.room_num}번에 예약하시겠습니까?`}
                      disabled={el.time.timestamp < CurDate.timestamp || list.check ? true : false}
                      onConfirm={()=>{reservation(el.timeNum,el.time,list.room_num)}}
                    >
                      <Button>
                        {list.check ?
                          ( <Popover 
                              content={`${el[list.num].name}(${el[list.num].part})`}
                              trigger="click"
                              title="예약"
                            >                     
                              <antIcon.AiOutlineBell style={{fontSize:"16px"}} />
                            </Popover>
                          ):
                          (
                            <>
                              {
                                list.room_num === 1 ? 
                                <antIcon.AiOutlineMan /> :
                                list.room_num === 2 ?
                                <antIcon.AiOutlineWoman /> :
                                <antIcon.AiOutlineUser />
                              }
                            </>
                          )
                        }
                        
                      </Button>
                    </Popconfirm>                    
                    
                      {/* {
                        room.room_num === userInfo.uid ?
                        "내 예약" : `${el.user.name}(${el.user.part})`
                      } */}
                    
                      
                    </>
                  ))
                }
                {el.room.user_uid === userInfo.uid &&
                  <Popconfirm
                    title="예약 취소 하시겠습니까?"
                    onConfirm={()=>{onCancel(el.timeNum)}}
                  >                  
                    {el.time.timestamp > CurDate.timestamp &&
                    <Button className="btn-del"><antIcon.AiOutlineRollback /></Button>
                    }
                  </Popconfirm>
                }
                </div> 
              </div>  
            </li>
          ))}
          </ul>
        </>
      }
    </>
  )
}

export default Chair
