import React, { useState, useEffect } from "react";
import firebase, { wel } from "../../firebase";
import { message, Button, Input, TimePicker, Radio } from "antd";
import { getFormatDate } from "../CommonFunc";
import moment from "moment";
const { TextArea } = Input;

function ChairAdmin() {
  const welDb = firebase.database(wel);

  const [DefaultNotice, setDefaultNotice] = useState();
  const [DefaultTimeSet, setDefaultTimeSet] = useState();

  //패널티 차감 시간
  const [panaltyTime, setPanaltyTime] = useState();
  const onPanaltyTime = (e) => {
    setPanaltyTime(e.target.value);
  };

  //예약가능횟수
  const [ableNum, setAbleNum] = useState();
  const onAbleNum = (e) => {
    setAbleNum(e.target.value);
  };

  //세팅값
  const [charSetting, setCharSetting] = useState();

  useEffect(() => {
    //세팅값 가져오기
    welDb.ref("chair/setting").once("value", (data) => {
      if (!data.val()) return;
      setCharSetting(data.val());
      setPanaltyTime(data.val().panaltyTime);
      setAbleNum(data.val().ableNum);
    });

    welDb.ref("chair/time_set").once("value", (data) => {
      setDefaultTimeSet(data.val());
    });

    welDb.ref("chair/notice").once("value", (data) => {
      setDefaultNotice(data.val());
    });
    return () => {};
  }, []);

  const [Notice, setNotice] = useState();
  const onNotice = (e) => {
    setNotice(e.target.value);
  };
  const onNoticeSubmit = () => {
    welDb.ref("chair").update({
      notice: Notice,
    });
  };

  const [TimeInterval, setTimeInterval] = useState();
  const onTimeInterval = (e) => {
    setTimeInterval(e.target.value);
  };

  const [TimeRange, setTimeRange] = useState();
  const [DateRange, setDateRange] = useState();
  const onTimeRange = (e) => {
    if (e) {
      let time = {
        start: [new Date(e[0]._d).getHours(), new Date(e[0]._d).getMinutes()],
        end: [new Date(e[1]._d).getHours(), new Date(e[1]._d).getMinutes()],
      };
      let date = {
        start: getFormatDate(new Date(e[0]._d)),
        end: getFormatDate(new Date(e[1]._d)),
      };
      setTimeRange(time);
      setDateRange(date);
    } else {
      setTimeRange("");
    }
  };

  const onTimeSubmit = () => {
    if (!TimeInterval && !DefaultTimeSet) {
      message.error("시간간격을 입력해 주세요");
      return;
    }
    if (!TimeRange && !DefaultTimeSet) {
      message.error("시작시작과 끝나는시간을 입력해 주세요");
      return;
    }
    welDb.ref("chair/time_set").update({
      interval: TimeInterval ? parseInt(TimeInterval) : DefaultTimeSet.interval,
      start: TimeRange ? TimeRange.start : DefaultTimeSet.start,
      end: TimeRange ? TimeRange.end : DefaultTimeSet.end,
      date_start: DateRange ? DateRange.start : DefaultTimeSet.date_start,
      date_end: DateRange ? DateRange.end : DefaultTimeSet.date_end,
    });
  };

  //차감시간,예약횟수 적용
  const onSubmitPaAb = () => {
    if (!panaltyTime) {
      message.error("패널티 차감 기준 시간을 입력해 주세요.");
      return;
    }
    if (!ableNum) {
      message.error("예약가능 횟수를 선택해 주세요.");
      return;
    }
    welDb.ref("chair/setting").update({
      panaltyTime,
      ableNum,
    });
  };

  return (
    <>
      <h3 className="title">공지사항</h3>
      <div className="flex-box">
        {DefaultNotice && (
          <TextArea
            style={{ height: "60px" }}
            onChange={onNotice}
            defaultValue={DefaultNotice}
          />
        )}
        {!DefaultNotice && (
          <TextArea style={{ height: "60px" }} onChange={onNotice} />
        )}
        <Button
          onClick={onNoticeSubmit}
          type="primary"
          style={{ marginLeft: "5px", height: "60px" }}
        >
          적용
        </Button>
      </div>
      {DefaultTimeSet && (
        <>
          <h3 className="title" style={{ marginTop: "20px" }}>
            시간 설정
          </h3>
          <Input
            type="number"
            style={{ width: "50px" }}
            onChange={onTimeInterval}
            defaultValue={DefaultTimeSet.interval}
          />{" "}
          분 간격
          <TimePicker.RangePicker
            style={{ marginLeft: "5px" }}
            format="HH:mm"
            onChange={onTimeRange}
            defaultValue={[
              moment(
                DefaultTimeSet.date_start.hour +
                  ":" +
                  DefaultTimeSet.date_start.min,
                "HH:mm"
              ),
              moment(
                DefaultTimeSet.date_end.hour +
                  ":" +
                  DefaultTimeSet.date_end.min,
                "HH:mm"
              ),
            ]}
          />
          <Button
            onClick={onTimeSubmit}
            type="primary"
            style={{ marginLeft: "5px" }}
          >
            적용
          </Button>
          <p style={{ marginTop: "5px", fontSize: "12px" }}>
            * 시간설정이 변경되면 현재 예약중인 시간이 변경 될 수 있습니다.
          </p>
        </>
      )}
      <hr style={{ opacity: 0.3, margin: "30px 0" }} />
      <h3 className="title" style={{ marginTop: "20px" }}>
        패널티 차감 기준 시간
      </h3>
      <Input
        type="number"
        style={{ width: "50px" }}
        onChange={onPanaltyTime}
        value={panaltyTime}
      />
      &nbsp;시간 (0일경우 차감 안됨)
      <h3 className="title" style={{ marginTop: "20px" }}>
        예약가능 횟수
      </h3>
      <Radio.Group
        optionType="button"
        buttonStyle="solid"
        onChange={onAbleNum}
        value={ableNum}
      >
        <Radio.Button value="1">1회</Radio.Button>
        <Radio.Button value="2">2회</Radio.Button>
        <Radio.Button value="3">3회</Radio.Button>
        <Radio.Button value="4">4회</Radio.Button>
        <Radio.Button value="5">5회</Radio.Button>
      </Radio.Group>
      <div style={{ marginTop: "20px" }}>
        <Button onClick={onSubmitPaAb} size="large" type="primary">
          적용
        </Button>
      </div>
    </>
  );
}

export default ChairAdmin;
