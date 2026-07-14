# 합격노트 · 정보처리기사 실기 학습 사이트 (React + Vite)

## 실행 방법

```bash
npm install
npm run dev
```

터미널에 뜨는 주소(보통 http://localhost:5173)로 접속하면 됩니다.

배포용 정적 파일이 필요하면:

```bash
npm run build
```

`dist/` 폴더가 생성되고, 이 폴더를 그대로 Netlify/Vercel/GitHub Pages 등에 올리면 됩니다.

## 폴더 구조

```
src/
  data/studyData.js      # 정보처리기사 실기 전 단원 용어 데이터 (여기에 용어 추가/수정)
  components/
    Sidebar.jsx           # 좌측 단원 네비게이션 + 검색 + 진행률
    StudyView.jsx         # 학습 모드 (목록+상세 / 집중 플래시카드 모드)
    QuizView.jsx          # 실전 테스트 (4지선다)
    WrongNoteView.jsx     # 오답노트
  utils.js                # 두문자 태그 추출, 셔플 등 공용 함수
  hooks/useLocalStorage.js
  App.jsx
  styles.css
```

## 용어 추가하는 법

`src/data/studyData.js` 에서 원하는 단원의 `cards` 배열에 아래 형식으로 추가하면 자동으로
학습 모드, 검색, 테스트 문제 출제에 반영됩니다.

```js
{ t: "용어명", d: "[두문자] 설명 내용..." }
```

`[두문자]`로 시작하면 자동으로 노란 하이라이터 태그로 표시됩니다.

## 데이터 저장

암기 체크 여부와 오답노트는 브라우저의 localStorage에 저장됩니다 (서버 없음, 기기별로 별도 저장).
