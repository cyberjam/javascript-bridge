/* eslint-disable no-unused-expressions */
/* eslint-disable object-curly-newline */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
const { Console } = require('@woowacourse/mission-utils');
const { BridgeSize, Moving, GameCommand, Map } = require('../model');
const { InputView, OutputView } = require('../view');
const BridgeGame = require('./BridgeGame');
const BridgeMaker = require('../BridgeMaker');
const BridgeRandomNumberGenerator = require('../BridgeRandomNumberGenerator');
/**
 * 다리 건너기 게임을 관리하는 클래스
 */
class BridgeGameControl {
  #inputView;

  #outputView;

  #bridgeGame;

  #canMovingCommands;

  #map;

  #survive;

  #movingCount;

  #tryCount;

  #isWin;

  constructor() {
    const inputView = Object.create(InputView);
    this.#inputView = inputView;
    const outputView = Object.create(OutputView);
    this.#outputView = outputView;
    const bridgeGame = new BridgeGame();
    this.#bridgeGame = bridgeGame;
    this.#movingCount = 0;
    this.#tryCount = 1;
    this.#isWin = false;
  }

  start() {
    this.#outputView.printStart();
    this.make();
  }

  makeRandomNumber(bridgeSize) {
    const bridgeMaker = Object.create(BridgeMaker);
    const bridgeRandomNumberGenerator = Object.create(BridgeRandomNumberGenerator);
    this.#canMovingCommands = bridgeMaker.makeBridge(bridgeSize.getBridgeSize(), bridgeRandomNumberGenerator.generate);
  }

  makeMap(bridgeSize) {
    const map = new Map(bridgeSize.getBridgeSize());
    this.#map = map;
    this.#map.setMap(this.#canMovingCommands);
  }

  bridgeSizeCallback(input) {
    const bridgeSize = new BridgeSize(input);
    if (!bridgeSize.getClose()) {
      this.makeRandomNumber(bridgeSize);
      this.makeMap(bridgeSize);
      this.move();
    }
  }

  make() {
    this.#inputView.readBridgeSize(this.bridgeSizeCallback.bind(this));
  }

  /**
   * 사용자가 칸을 이동할 때 사용하는 메서드
   * <p>
   * 이동을 위해 필요한 메서드의 반환 값(return value), 인자(parameter)는 자유롭게 추가하거나 변경할 수 있다.
   */
  movingMove() {
    this.#bridgeGame.importMap(this.#map);
    this.#bridgeGame.move();
  }

  movingMatch(moving) {
    this.#survive = this.#bridgeGame.matchResult(moving.getMoving());
  }

  movingPrint() {
    this.#outputView.printMap(this.#map, this.#bridgeGame.getCurrentPosition());
  }

  movingSurvive() {
    this.#movingCount += 1;
    this.move();
  }

  movingDie() {
    this.retry();
  }

  movingProcess(moving) {
    this.movingMove();
    this.movingMatch(moving);
    this.movingPrint();
    this.#survive ? this.movingSurvive() : this.movingDie();
  }

  movingCallback(input) {
    const moving = new Moving(input);
    if (!moving.getClose()) this.movingProcess(moving);
  }

  move() {
    if (this.#map.getMapLength() > this.#movingCount) {
      this.#inputView.readMoving(this.movingCallback.bind(this));
    }
    if (this.#map.getMapLength() === this.#movingCount) {
      this.#isWin = true;
      this.end();
    }
  }

  /**
   * 사용자가 게임을 다시 시도할 때 사용하는 메서드
   * <p>
   * 재시작을 위해 필요한 메서드의 반환 값(return value), 인자(parameter)는 자유롭게 추가하거나 변경할 수 있다.
   */

  gameCommandRestart() {
    this.#tryCount += 1;
    this.#movingCount = 0;
    this.#bridgeGame.retry();
    this.move();
  }

  gameCommandQuit() {
    this.end();
  }

  gameCommandProcess(gameCommand) {
    if (gameCommand.getGameCommand() === 'R') this.gameCommandRestart();
    if (gameCommand.getGameCommand() === 'Q') this.gameCommandQuit();
    // Console.print(gameCommand.getGameCommand());
    // Console.close();
  }

  gameCommandCallback(input) {
    const gameCommand = new GameCommand(input);
    if (!gameCommand.getClose()) {
      this.gameCommandProcess(gameCommand);
    }
  }

  retry() {
    this.#inputView.readGameCommand(this.gameCommandCallback.bind(this));
  }

  end() {
    this.#outputView.printEnd();
    this.movingPrint();
    this.#outputView.printResult(this.#isWin, this.#tryCount);
  }
}

module.exports = BridgeGameControl;
