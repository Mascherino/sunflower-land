export class SpeechBubble extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  bubble: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene, text: string, direction: "left" | "right") {
    super(scene, 0, 0);
    this.scene = scene;

    const MAX_WIDTH = 100;
    const MAX_CHARS_PER_LINE = 40;
    // const formattedText = this.wordWrap(text, MAX_CHARS_PER_LINE);
    const formattedText = text;

    this.text = scene.add.text(0, 0, formattedText, {
      fontFamily: "monogram",
      // fontSize: "16",
      color: "rgb(0,0,0)",
    });

    const bounds = this.text.getBounds();

    this.bubble = (this.scene.add as any).rexNinePatch2({
      x: bounds.centerX - 0.3,
      y: bounds.centerY + 2,
      width: bounds.width + 6,
      height: bounds.height,
      key: "speech_bubble",
      columns: [5, 2, 2],
      rows: [2, 3, 4],
      baseFrame: undefined,
      getFrameNameCallback: undefined,
    });

    this.bubble.setScale(direction === "right" ? 1 : -1, 1);

    this.add(this.bubble);
    this.add(this.text);

    this.bubble.setAlpha(0.8);

    this.setPosition(
      direction === "right" ? 2 : -bounds.width,
      -bounds.height - 12,
    );
  }
}
