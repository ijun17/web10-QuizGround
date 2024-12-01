<div align="center">
  <h1>QuizGround</h1>
</div>

![0](https://github.com/user-attachments/assets/de64e956-2f62-4d42-8932-3216b354091c)

<br>

<p align=center>
  <a href="http://quizground.duckdns.org/">서비스 링크</a>
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
- [✍🏻 소개](#-소개)
- [🚀 핵심 기능](#-핵심-기능)
  - [게임 플레이](#게임-플레이)
  - [퀴즈셋 제작](#퀴즈셋-제작)
  - [대기방 목록](#대기방-목록)
- [⚙️ 기술 스택](#️-기술-스택)
- [🏛️ 시스템 아키텍처](#️-시스템-아키텍처)
- [🚨 FE 핵심 경험](#-fe-핵심-경험)
  - [실시간 200명 플레이어 렌더링 59% 성능 향상](#실시간-200명-플레이어-렌더링-59-성능-향상)
  - [Canvas를 통한 게임 이펙트 렌더링 최적화](#canvas를-통한-게임-이펙트-렌더링-최적화)
  - [백엔드 없이도 개발하자!](#백엔드-없이도-개발하자)
- [🔥 BE 핵심 경험](#-be-핵심-경험)
  - [멀티 프로세스를 통한 36% 성능 향상](#멀티-프로세스를-통한-36-성능-향상)
  - [우리는 어떻게 Redis를 사용했는가?](#우리는-어떻게-redis를-사용했는가)
  - [Redis 메모리 아껴쓰기!](#redis-메모리-아껴쓰기)
- [🤗 시크릿주주 팀 소개](#-시크릿주주-팀-소개)

<br>

## ✍🏻 소개

<img width="1102" alt="1" src="https://github.com/user-attachments/assets/9db10c53-69c1-47a9-8de1-f662dcc81b3e">

- QuizGround는 실시간 퀴즈 게임 플랫폼입니다!
- 귀여운 이모지 캐릭터로 변신하여 퀴즈를 풀 수 있어요!
- 한 게임방에서 최대 200명까지 플레이할 수 있어요!

<br>

## 🚀 핵심 기능

### 게임 플레이

> 실시간으로 캐릭터를 움직여 퀴즈를 풀 수 있어요!
채팅도 주고받을 수 있어요!
> 

<img width="1100" alt="2" src="https://github.com/user-attachments/assets/5f184d43-0c4f-4968-981e-661eb6c975a4">

1. 서바이벌 모드: 퀴즈를 맞추면서 끝까지 살아남아보세요!
2. 랭킹 모드: 퀴즈를 맞추면 점수를 받을 수 있고, 랭킹을 실시간으로 볼 수 있어요!

### 퀴즈셋 제작

> 내가 퀴즈를 직접 만들어 플레이할 수 있어요!
> 

<img width="892" alt="3" src="https://github.com/user-attachments/assets/6a78a793-bfa9-4dad-8621-00a8923fd372">

### 대기방 목록

> 현재 대기방 목록에 있는 게임방에 자유롭게 참여할 수 있어요!
> 

<img width="1100" alt="4" src="https://github.com/user-attachments/assets/ea28fa2e-c531-44dc-b1b6-a7104c62f0e1">

<br>

## ⚙️ 기술 스택

<img width="718" alt="image" src="https://github.com/user-attachments/assets/e53eeb6b-7271-4bf8-a504-2b6d3b58cc72">

<br>

## 🏛️ 시스템 아키텍처

<img width="718" alt="image" src="https://github.com/user-attachments/assets/0d7d9130-2a3f-4703-a45b-ad497376c3bc">

<br>

## 🚨 FE 핵심 경험

### 실시간 200명 플레이어 렌더링 59% 성능 향상

- 동기
    - 200명이 한 게임방에서 원활히 플레이할 수 있는 걸 목표로 했습니다.
- 행동
    - 부하 테스트를 통해 200명이 원활히 플레이 가능한지 테스트했습니다.
    - 상태에 대한 자료구조와 구독 방식을 바꾸어 개선했습니다.
- 결과
    - 200명이 5초간 위치 업데이트를 하면 기존에는 `16.71초`가 걸렸지만 **`6.71초`**로 59% 빨라졌습니다.
- 해당 경험이 더 궁금하시다면?
    - [실시간 200명 플레이어 렌더링을 위한 최적화 과정](https://www.notion.so/200-82acd52251d2439091d101e193a26c9b?pvs=21)

### Canvas를 통한 게임 이펙트 렌더링 최적화

- 동기
    - 퀴즈가 끝날 때 여러 이펙트가 작동하면서 부하가 생겨 화면이 느려지는 문제점을 발견했습니다.
- 행동
    - canvas를 사용하여 재렌더링 성능을 높였습니다.
    - Lottie 애니메이션 파일을 최적화하여 렌더링 성능을 높였습니다.
- 결과
    - 게임 특성 상 시각적으로 중요한 이펙트 렌더링에 대해 최적화했습니다.
- 해당 경험이 더 궁금하시다면?
    - [게임 이펙트 렌더링 최적화](https://www.notion.so/Lottie-f0b49cc4183d47a48b976daa61207028?pvs=21)

### 백엔드 없이도 개발하자!

- 동기
    - 백엔드보다 프론트 진행 상황이 더 빨라 구현한 게 실제로 동작하는지 확인하기가 어려웠습니다.
- 행동
    - SocketMock을 만들어 서버가 있는 것처럼 테스트할 수 있게 했습니다.
    - 간단히 PIN번호만 입력하면 여러 시나리오에 대해 테스트할 수 있습니다.
- 결과
    - 백엔드 개발 상황에 무관하게 프론트에서 개발한 기능을 테스트할 수 있습니다.
- 해당 경험이 더 궁금하시다면?
    - [소켓 서버 없이 게임 시나리오 테스트하기](https://www.notion.so/2333831fc7504299b9fecd2fc12a57c1?pvs=21)

<br>

## 🔥 BE 핵심 경험

### 멀티 프로세스를 통한 36% 성능 향상

- 동기
    - 200명이 한 게임방에서 원활히 플레이할 수 있는 걸 목표로 했습니다.
- 행동
    - 부하 테스트를 통해 200명이 원활히 플레이 가능한지 테스트했습니다.
    - 멀티 프로세스로 운영하여 소켓 메시지 응답 시간을 줄였습니다.
- 결과
    - **위치 업데이트**가  `1.43초`에서 `0.91초`로 **36% 빨라졌습니다.**
    - **실시간 채팅**이 `1.20초`에서 `0.79초`로 **34% 빨라졌습니다.**
- 해당 경험이 더 궁금하시다면?
    - [[최적화] 멀티 프로세스를 통한 36% 성능 향상 ](https://www.notion.so/57-eed2841cf83447fb924fed316a321f19?pvs=21)

### 우리는 어떻게 Redis를 사용했는가?

- 동기
    - 게임 서버의 부하 분산과 세션 관리를 효율적으로 처리하기 위해 Redis를 선택했습니다.
- 행동
    - Redis를 쓰기 전에 Data Modeling을 하면서 자료구조를 어떻게 쓸지 논의했습니다.
    - Redis의 `Pub/Sub`, `Keyspace Notifications` 기능을 활용하여 퀴즈 게임을 진행했습니다.
- 결과
    - Redis를 통해 세션을 관리함으로써 멀티 프로세스를 쉽게 운영할 수 있었습니다.
- 해당 경험이 더 궁금하시다면?
    - [[구현] 우리가 Redis를 사용한 방식](https://www.notion.so/Redis-14ec2492516b80068a2be4e30f058e7f?pvs=21)

### Redis 메모리 아껴쓰기!

- 동기
    - 게임방 운영 시 불필요한 데이터로 인한 Redis 메모리 증가 문제 해결이 필요했습니다.
- 행동
    - TTL 적용 및 SCAN/Pipeline 도입으로 최적화했습니다.
    - lastActivityAt + 인터셉터 패턴으로 방 활성화 관리 모듈을 구현했습니다.
- 결과
    - 불필요한 데이터는 자동 정리되어 Redis 메모리를 효율적으로 관리했습니다.
- 해당 경험이 더 궁금하시다면?
    - [[최적화] effective한 redis memory 관리](https://www.notion.so/effective-redis-memory-1a819eb7e512469b91b287cf8c627abd?pvs=21)

<br>

## 🤗 시크릿주주 팀 소개

|김상혁|김준기|송건석|유동훈|박준우|
|:---:|:---:|:---:|:---:|:---:|
|<img src="https://avatars.githubusercontent.com/u/123712285?v=4" width="120" height="120" alt="김상혁 프로필">|<img src="https://avatars.githubusercontent.com/u/54887575?v=4" width="120" height="120" alt="김준기 프로필">|<img src="https://avatars.githubusercontent.com/u/12987674?v=4" width="120" height="120" alt="송건석 프로필">|<img src="https://avatars.githubusercontent.com/u/50190387?v=4" width="120" height="120" alt="유동훈 프로필">|<img src="https://avatars.githubusercontent.com/u/97427744?v=4" width="120" height="120" alt="박준우 프로필">|
|BE|FE|BE|BE|FE|
|[@NewCodes7](https://github.com/NewCodes7)|[@ijun17](https://github.com/ijun17)|[@songbuild00](https://github.com/songbuild00)|[@DongHoonYu96](https://github.com/DongHoonYu96)|[@always97](https://github.com/always97)
