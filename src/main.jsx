import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// static/pretendard.css 는 weight 별 통짜 폰트라 실제로 쓰는 6개 weight 만 해도
// 첫 로드에 4.6MB 를 받는다. variable 다이내믹 서브셋은 weight 축 하나로 100~900 을
// 모두 커버하면서 화면에 실제로 그려진 글자의 유니코드 범위 조각만 내려받는다.
// 폰트 이름이 'Pretendard' 가 아니라 'Pretendard Variable' 이므로
// index.css / tailwind.config.js / index.html 의 font-family 스택도 같이 맞춰야 한다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
