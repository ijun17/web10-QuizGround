![0](https://github.com/user-attachments/assets/de64e956-2f62-4d42-8932-3216b354091c)

<br>

<p align=center>
  <a href="https://quizground.site/">
    <img src="https://github.com/user-attachments/assets/a1fbf199-2976-4f0a-ac8f-bab4d7a11c97" alt="퀴즈그라운드 바로가기" width="250px"/>
  </a>
  <br>
  <br>
  <a href="https://s0n9.notion.site/QuizGround-12ac2492516b80ae93ccc80823d234a9?pvs=4">팀 노션</a>
  &nbsp; | &nbsp; 
  <a href="https://github.com/orgs/boostcampwm-2024/projects/18">백로그</a>
  &nbsp; | &nbsp;
  <a href="https://github.com/boostcampwm-2024/web10-QuizGround/wiki">개발 위키</a>
</p>

<br>

## 📄 목차

- [📄 목차](#-목차)
- [✍🏻 서비스 소개](#-서비스-소개)
- [🚀 핵심 기능](#-핵심-기능)
  * [게임 모드](#게임-모드)
  * [실시간 상호작용](#실시간-상호작용)
  * [200명과 함께 하는 게임](#200명과-함께-하는-게임)
- [🔥 200명의 실시간 위치 업데이트를 최적화하기까지](#-200명의-실시간-위치-업데이트를-최적화하기까지)
  * [[FE] 실시간 200명 플레이어 렌더링 59% 성능 향상](#fe-실시간-200명-플레이어-렌더링-59-성능-향상)
  * [[BE] 멀티 프로세스를 통한 36% 성능 향상](#be-멀티-프로세스를-통한-36-성능-향상)
- [🚨 [FE] 핵심 경험](#-fe-핵심-경험)
  * [Canvas를 통한 게임 이펙트 렌더링 최적화](#canvas를-통한-게임-이펙트-렌더링-최적화)
  * [백엔드 없이도 개발하자!](#백엔드-없이도-개발하자)
  * [클라이언트와 서버 시간을 동기화하자!](#클라이언트와-서버-시간을-동기화하자)
- [⭐ [BE] 핵심 경험](#-be-핵심-경험)
  * [우리는 어떻게 Redis를 사용했는가?](#우리는-어떻게-redis를-사용했는가)
  * [Redis 메모리 아껴쓰기!](#redis-메모리-아껴쓰기)
  * [WAS 해킹을 당했어요!](#was-해킹을-당했어요)
- [📚 기술 스택](#-기술-스택)
- [🏪 시스템 아키텍처](#-시스템-아키텍처)
- [🤗 시크릿주주 팀원](#-시크릿주주-팀원)

<br>

## ✍🏻 서비스 소개

<img width="1102" alt="1" src="https://github.com/user-attachments/assets/9db10c53-69c1-47a9-8de1-f662dcc81b3e">

- QuizGround는 실시간 퀴즈 게임 플랫폼입니다!
- 귀여운 이모지 캐릭터로 변신하여 퀴즈를 풀 수 있어요!
- 한 게임방에서 최대 200명까지 플레이할 수 있어요!

<br>

## 🚀 핵심 기능

### 게임 모드

> **생존 모드** 또는 **랭킹 모드** 중 선택하여 플레이할 수 있습니다.

<table align="center">
<tr>
  <td>
    <img src="https://github.com/user-attachments/assets/883e4920-ba5b-4d5f-a176-d32e152174a8" alt="survival" />
  </td>
  <td>
    <img src="https://github.com/user-attachments/assets/79707267-b5f4-4df3-83b5-5d47ae515598" alt="ranking3" />
  </td>
</tr>
<tr>
  <td align="center">
    <p>[생존 모드] 퀴즈를 맞춰 끝까지 살아남아보세요!</p>
  </td>
  <td align="center">
    <p>[랭킹 모드] 퀴즈를 맞춰 점수를 모아보세요!</p>
  </td>
</tr>
</table>

### 실시간 상호작용

> **실시간 채팅**과 **실시간 이동**으로 다른 사용자들과 상호작용할 수 있습니다.

<table align=center>
<tr>
  <td>
    <img src="https://github.com/user-attachments/assets/468c675a-b2cd-4704-8e93-4d7035990e77" alt="chat" />
  </td>
  <td>
    <img src="https://github.com/user-attachments/assets/fc395667-5455-439a-82df-ae8a8fe8f96c" alt="update" />
  </td>
</tr>
<tr>
  <td>
    <p align=center>실시간 채팅</p>
  </td>
  <td>
    <p align=center>실시간 이동</p>
  </td>
</tr>
</table>

### 200명과 함께 하는 게임

> 위 모든 기능이 200명이 있는 게임방에서도 가능해요!

<img width=800px src="https://github.com/user-attachments/assets/b1ad07e6-9f0f-456c-8f2f-91729f97e1a0" alt="ranking3" />

<br>
<br>

## 🔥 200명의 실시간 위치 업데이트를 최적화하기까지

> 200명이 한 게임방에서 원활히 플레이할 수 있도록 노력했어요!

### [FE] 실시간 200명 플레이어 렌더링 59% 성능 향상

- 동기
    - 200명이 한 게임방에서 원활히 플레이할 수 있는 걸 목표로 했습니다.
- 행동
    - 부하 테스트를 통해 200명이 원활히 플레이 가능한지 테스트했습니다.
    - 상태에 대한 자료구조와 구독 방식을 바꾸어 개선했습니다.
- 결과
    - 200명이 5초간 위치 업데이트를 하면 기존에는 `16.71초`가 걸렸지만 `6.71초`로 59% 빨라졌습니다.
- 해당 경험이 더 궁금하시다면?
    - [노션 링크](https://www.notion.so/200-82acd52251d2439091d101e193a26c9b?pvs=21) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%EC%8B%A4%EC%8B%9C%EA%B0%84-200%EB%AA%85-%ED%94%8C%EB%A0%88%EC%9D%B4%EC%96%B4-%EB%A0%8C%EB%8D%94%EB%A7%81%EC%9D%84-%EC%9C%84%ED%95%9C-%EC%B5%9C%EC%A0%81%ED%99%94-%EA%B3%BC%EC%A0%95)

### [BE] 캐릭터 위치 업데이트 최적화 

- 동기
    - 200명이 한 게임방에서 원활히 플레이할 수 있는 걸 목표로 했습니다.
- 행동
    - 부하 테스트를 통해 200명이 원활히 플레이 가능한지 테스트했습니다.
    - 멀티 프로세스로 운영하여 소켓 메시지 응답 시간을 줄였습니다.
    - 배치 처리를 도입하여 소켓 메시지 응답 시간을 줄였습니다. 
- 결과
    - 멀티 프로세스를 통해 위치 업데이트에 대한 서버 응답시간을 p95 `18.7초`에서 `7.1초`로 개선했습니다.
    - 배치 처리를 통해 위치 업데이트에 대한 서버 응답시간을 p95 `7.1초`에서 `0.11초`로 개선했습니다. 
- 해당 경험이 더 궁금하시다면?
    - [노션 링크](https://s0n9.notion.site/d59740bf3feb45fdb74db4e6658ac1b6?pvs=4) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%5B%EC%B5%9C%EC%A0%81%ED%99%94%5D-%EC%BA%90%EB%A6%AD%ED%84%B0-%EC%97%85%EB%8D%B0%EC%9D%B4%ED%8A%B8-%EC%84%9C%EB%B2%84-%EC%9D%91%EB%8B%B5%EC%8B%9C%EA%B0%84-%EC%B5%9C%EC%A0%81%ED%99%94)
 
<br>

## 🚨 [FE] 핵심 경험

> FE에서는 이런 경험도 했어요!

### Canvas를 통한 게임 이펙트 렌더링 최적화

- 동기
    - 퀴즈가 끝날 때 여러 이펙트가 작동하면서 부하가 생겨 화면이 느려지는 문제점을 발견했습니다.
- 행동
    - canvas를 사용하여 재렌더링 성능을 높였습니다.
    - Lottie 애니메이션 파일을 최적화하여 렌더링 성능을 높였습니다.
- 결과
    - 게임 특성 상 시각적으로 중요한 이펙트 렌더링에 대해 최적화했습니다.
- 해당 경험이 더 궁금하시다면?
    - [노션 링크](https://www.notion.so/Lottie-f0b49cc4183d47a48b976daa61207028?pvs=21) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/Canvas%EB%A1%9C-%EC%95%A0%EB%8B%88%EB%A9%94%EC%9D%B4%EC%85%98-%EB%A0%8C%EB%8D%94%EB%A7%81-%EC%B5%9C%EC%A0%81%ED%99%94%ED%95%98%EA%B8%B0)

### 백엔드 없이도 개발하자!

- 동기
    - 백엔드보다 프론트 진행 상황이 더 빨라 구현한 게 실제로 동작하는지 확인하기가 어려웠습니다.
- 행동
    - SocketMock을 만들어 서버가 있는 것처럼 테스트할 수 있게 했습니다.
    - 간단히 PIN번호만 입력하면 여러 시나리오에 대해 테스트할 수 있습니다.
- 결과
    - 백엔드 개발 상황에 무관하게 프론트에서 개발한 기능을 테스트할 수 있습니다.
- 해당 경험이 더 궁금하시다면?
    - [노션 링크](https://www.notion.so/2333831fc7504299b9fecd2fc12a57c1?pvs=21) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%EC%86%8C%EC%BC%93-%EC%84%9C%EB%B2%84-%EC%97%86%EC%9D%B4-%EA%B2%8C%EC%9E%84-%EC%8B%9C%EB%82%98%EB%A6%AC%EC%98%A4-%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EA%B8%B0)

### 클라이언트와 서버 시간을 동기화하자!

- 동기
  - 클라이언트와 서버 시간이 달라지는 오류가 발생하였습니다.
- 행동
  - 클라이언트가 주기적으로 서버 시간을 가져와 로컬 시간과의 차이를 계산합니다.
- 결과
  - 모든 클라이언트가 거의 동일한 상황에 퀴즈를 시작할 수 있게 되었습니다.
- 해당 경험이 더 궁금하시다면?
  - [노션 링크](https://s0n9.notion.site/1b53dc837ba3441d9476e3df9c1f6d55) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%EC%BB%B4%ED%93%A8%ED%84%B0-%EC%8B%9C%EA%B0%84%EC%9D%B4-%EC%84%9C%EB%B2%84%EB%9E%91-%EC%95%88-%EB%A7%9E%EC%9C%BC%EB%A9%B4-%EA%B7%B8%EA%B1%B4-%EA%B7%B8-%EC%82%AC%EB%9E%8C-%EC%9E%98%EB%AA%BB-%EC%95%84%EB%8B%8C%EA%B0%80%3F)

<br>

## ⭐ [BE] 핵심 경험

> BE에서는 이런 경험도 했어요!

### 우리는 어떻게 Redis를 사용했는가?

- 동기
    - 게임 서버의 부하 분산과 세션 관리를 효율적으로 처리하기 위해 Redis를 선택했습니다.
- 행동
    - Redis를 쓰기 전에 Data Modeling을 하면서 자료구조를 어떻게 쓸지 논의했습니다.
    - Redis의 `Pub/Sub`, `Keyspace Notifications` 기능을 활용하여 퀴즈 게임을 진행했습니다.
- 결과
    - Redis를 통해 세션을 관리함으로써 멀티 프로세스를 쉽게 운영할 수 있었습니다.
- 해당 경험이 더 궁금하시다면?
    - [노션 링크](https://www.notion.so/Redis-14ec2492516b80068a2be4e30f058e7f?pvs=21) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%EC%9A%B0%EB%A6%AC%EA%B0%80-Redis%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%9C-%EB%B0%A9%EC%8B%9D)

### Redis 메모리 아껴쓰기!

- 동기
    - 게임방 운영 시 불필요한 데이터로 인한 Redis 메모리 증가 문제 해결이 필요했습니다.
- 행동
    - TTL 적용 및 SCAN/Pipeline 도입으로 최적화했습니다.
    - lastActivityAt + 인터셉터 패턴으로 방 활성화 관리 모듈을 구현했습니다.
- 결과
    - 불필요한 데이터는 자동 정리되어 Redis 메모리를 효율적으로 관리했습니다.
- 해당 경험이 더 궁금하시다면?
    - [노션 링크](https://www.notion.so/effective-redis-memory-1a819eb7e512469b91b287cf8c627abd?pvs=21) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%5B%EC%B5%9C%EC%A0%81%ED%99%94%5D-effective%ED%95%9C-redis-memory-%EA%B4%80%EB%A6%AC)

### WAS 해킹을 당했어요!

- 동기
  - 데모 데이 1일 전 서버가 갑자기 안되는 이슈가 생겼습니다.
- 행동
  - pm2 로그가 아무것도 나오지 않았고, Ncloud를 확인해보니 cpu 100%를 찍고 있었습니다.
- 결과
  - 네이버 클라우드로 보안 이벤트 알림을 받았습니다.
- 왜 해킹당했는지 더 궁금하시다면?
  - [노션 링크](https://s0n9.notion.site/WAS-60f4c9deb87d4329bb274699b88ed429) or [위키 링크](https://github.com/boostcampwm-2024/web10-QuizGround/wiki/%5B%ED%8A%B8%EB%9F%AC%EB%B8%94%EC%8A%88%ED%8C%85%5D-WAS-%ED%95%B4%ED%82%B9%EC%9D%84-%EB%8B%B9%ED%96%88%EC%96%B4%EC%9A%94!)

<br>

## 📚 기술 스택

<img width="718" alt="image" src="https://github.com/user-attachments/assets/56afd295-8996-4484-a753-862dc94924aa">

<br>
<br>

## 🏪 시스템 아키텍처

<img width="718" alt="image" src="https://github.com/user-attachments/assets/0d7d9130-2a3f-4703-a45b-ad497376c3bc">

<br>
<br>

## 🤗 시크릿주주 팀원

|김상혁|김준기|송건석|유동훈|박준우|
|:---:|:---:|:---:|:---:|:---:|
|<img src="https://avatars.githubusercontent.com/u/123712285?v=4" width="120" height="120" alt="김상혁 프로필">|<img src="https://avatars.githubusercontent.com/u/54887575?v=4" width="120" height="120" alt="김준기 프로필">|<img src="https://avatars.githubusercontent.com/u/12987674?v=4" width="120" height="120" alt="송건석 프로필">|<img src="https://avatars.githubusercontent.com/u/50190387?v=4" width="120" height="120" alt="유동훈 프로필">|<img src="https://avatars.githubusercontent.com/u/97427744?v=4" width="120" height="120" alt="박준우 프로필">|
|BE|FE|BE|BE|FE|
|[@NewCodes7](https://github.com/NewCodes7)|[@ijun17](https://github.com/ijun17)|[@songbuild00](https://github.com/songbuild00)|[@DongHoonYu96](https://github.com/DongHoonYu96)|[@always97](https://github.com/always97)
