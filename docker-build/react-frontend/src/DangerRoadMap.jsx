import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function getColorByGrade(grade) {
  switch (grade) {
    case 1:
      return "#27ae60"; // 녹색 (안전)
    case 2:
      return "#f39c12"; // 주황 (주의)
    case 3:
      return "#d35400"; // 짙은 주황/빨강 (위험)
    case 4:
      return "#c0392b"; // 진한 빨강 (심각)
    default:
      return "#7f8c8d"; // 회색 (알 수 없음)
  }
}

function getGradeLabel(grade) {
  switch (grade) {
    case 1:
      return "안전";
    case 2:
      return "주의";
    case 3:
      return "위험";
    case 4:
      return "심각";
    default:
      return "알 수 없음";
  }
}

function SetMapCenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const Legend = () => {
  const grades = [1, 2, 3, 4];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "white",
        padding: "10px 15px",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        fontSize: 14,
        lineHeight: 1.5,
        color: "#34495e",
        zIndex: 1000,
        userSelect: "none",
      }}
    >
      <strong>위험도 등급</strong>
      {grades.map((grade) => (
        <div
          key={grade}
          style={{ display: "flex", alignItems: "center", marginTop: 6 }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: getColorByGrade(grade),
              borderRadius: 4,
              marginRight: 8,
              border: "1px solid #999",
            }}
          />
          <span>{getGradeLabel(grade)}</span>
        </div>
      ))}
    </div>
  );
};

const InfoBanner = () => (
  <div
    style={{
      position: "absolute",
      bottom: 10,
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(52, 73, 94, 0.9)",
      color: "white",
      padding: "8px 20px",
      borderRadius: 20,
      fontSize: 14,
      zIndex: 1000,
      userSelect: "none",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}
  >
    구간에 마우스를 올리면 위험도 정보를 확인할 수 있습니다.
  </div>
);

const DangerRoadMap = () => {
  const [roadSegments, setRoadSegments] = useState([]);
  const [center, setCenter] = useState([37.456, 127.045]); // 기본 중심 좌표

  useEffect(() => {
    const fetchData = () => {
	    fetch("/api/road-risk/segments")
		    .then((res) => res.json())
		    .then((data) => {
			    setRoadSegments(data);
			    if (data.length > 0) setCenter([data[0].startLat, data[0].startLng]);
		    })
		    .catch((err) => console.error("데이터 가져오기 실패:", err));
    };
    fetchData(); // 초기 데이터 호출

    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // 5분마다 호출

    return () => clearInterval(intervalId); // 언마운트 시 인터벌 해제
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 3px 15px rgba(0,0,0,0.2)",
        position: "relative", // Legend와 InfoBanner 절대위치 기준
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#34495e" }}>
        도로 위험도 모니터링
      </h2>

      <InfoBanner />

      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "600px", width: "100%", borderRadius: 10 }}
      >
        <SetMapCenter center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {roadSegments.map((segment) => {
          const positions = [
            [segment.startLat, segment.startLng],
            [segment.endLat, segment.endLng],
          ];
          const color = getColorByGrade(segment.analsGrd);
          const gradeLabel = getGradeLabel(segment.analsGrd);

          return (
            <Polyline
              key={segment.id}
              positions={positions}
              pathOptions={{ color, weight: 8, opacity: 0.9 }}
              interactive={true}
            >
              <Tooltip direction="top" offset={[0, -10]} sticky>
                <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                  <b>고속도로명:</b> {segment.highwayName}
                  <br />
                  <b>구간명:</b> {segment.segmentName}
                  <br />
                  <b>위험도 등급:</b>{" "}
                  <span style={{ color }}>
                    {segment.analsGrd} ({gradeLabel})
                  </span>
                  <br />
                  <b>위험도 값:</b> {segment.analsValue.toFixed(2)}
                  <br />
                  <b>시작 좌표:</b> [{segment.startLat.toFixed(5)},{" "}
                  {segment.startLng.toFixed(5)}]<br />
                  <b>끝 좌표:</b> [{segment.endLat.toFixed(5)},{" "}
                  {segment.endLng.toFixed(5)}]
                </div>
              </Tooltip>
            </Polyline>
          );
        })}
      </MapContainer>
      <Legend />
    </div>
  );
};

export default DangerRoadMap;
