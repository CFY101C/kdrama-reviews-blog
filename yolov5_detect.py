"""
YOLOv5 目标检测 — 支持图片 / 视频 / 摄像头
使用 ultralytics 官方库 (兼容 YOLOv5)
安装: pip install ultralytics opencv-python
"""

import argparse
import cv2
from ultralytics import YOLO


def detect_image(model, source, conf=0.25, save=True):
    """对图片做目标检测并保存结果"""
    results = model(source, conf=conf)
    for r in results:
        annotated = r.plot()
        if save:
            out_path = f"result_{source.split('/')[-1]}"
            cv2.imwrite(out_path, annotated)
            print(f"结果已保存至: {out_path}")
        cv2.imshow("YOLOv5 Detection", annotated)
        cv2.waitKey(0)
    cv2.destroyAllWindows()


def detect_video(model, source, conf=0.25):
    """对视频做目标检测"""
    cap = cv2.VideoCapture(source)
    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            break
        results = model(frame, conf=conf, verbose=False)
        annotated = results[0].plot()
        cv2.imshow("YOLOv5 Detection", annotated)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    cap.release()
    cv2.destroyAllWindows()


def detect_webcam(model, conf=0.25):
    """摄像头实时检测"""
    cap = cv2.VideoCapture(0)
    print("按 'q' 退出")
    while cap.isOpened():
        ok, frame = cap.read()
        if not ok:
            break
        results = model(frame, conf=conf, verbose=False)
        annotated = results[0].plot()
        cv2.imshow("YOLOv5 Detection", annotated)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    cap.release()
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(description="YOLOv5 目标检测")
    parser.add_argument("--source", type=str, default="0",
                        help="输入源: 图片路径 / 视频路径 / 0(摄像头)")
    parser.add_argument("--model", type=str, default="yolov5s.pt",
                        help="模型文件: yolov5n.pt | yolov5s.pt | yolov5m.pt | yolov5l.pt | yolov5x.pt")
    parser.add_argument("--conf", type=float, default=0.25,
                        help="置信度阈值 (0~1)")
    args = parser.parse_args()

    model = YOLO(args.model)

    source = args.source
    if source == "0":
        detect_webcam(model, conf=args.conf)
    elif source.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp")):
        detect_image(model, source, conf=args.conf)
    else:
        detect_video(model, source, conf=args.conf)


if __name__ == "__main__":
    main()
