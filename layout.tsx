import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'하루한뼘 | 초등 매일 자율학습',description:'초등 1~6학년, 내 속도로 공부하는 매일 학습실. 맞춤 문제 풀이와 인쇄 학습지.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
