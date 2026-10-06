const DrawNumberControl = ({
  drawNumber,
  setDrawNumber,
  currentDrawNumber,
}) => {
  const increaseDraw = () => {
    setDrawNumber((prev) => {
      const current = Number(currentDrawNumber);
      const previous = Number(prev);

      if (Number.isNaN(current) || Number.isNaN(previous)) {
        return previous;
      }
      return Math.min(previous + 1, current);
    });
  };

  const decreaseDraw = () => {
    setDrawNumber((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="draw-number-control">
      <button
        type="button"
        className="draw-arrow"
        onClick={increaseDraw}
        disabled={drawNumber >= currentDrawNumber}
      >
        ▲
      </button>

      <div className="draw-number-display">{drawNumber}</div>

      <button
        type="button"
        className="draw-arrow"
        onClick={decreaseDraw}
        disabled={drawNumber <= 1}
      >
        ▼
      </button>
    </div>
  );
};

export default DrawNumberControl;
