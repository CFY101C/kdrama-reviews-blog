"""
YOLOv5 自定义数据集训练脚本
安装: pip install ultralytics
"""

from ultralytics import YOLO


def train():
    model = YOLO("yolov5s.pt")  # 从预训练权重开始

    results = model.train(
        data="dataset.yaml",     # 数据集配置 (见下方说明)
        epochs=100,
        imgsz=640,
        batch=16,
        name="yolov5_custom",
        patience=10,             # 早停: 10 个 epoch 无提升则停止
        lr0=0.01,                # 初始学习率
        lrf=0.01,                # 最终学习率 = lr0 * lrf
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=3,
        augment=True,            # 数据增强
    )

    return results


def validate():
    """验证训练好的模型"""
    model = YOLO("runs/detect/yolov5_custom/weights/best.pt")
    metrics = model.val()
    print(metrics)


def export_onnx():
    """导出 ONNX 用于部署"""
    model = YOLO("runs/detect/yolov5_custom/weights/best.pt")
    model.export(format="onnx")


if __name__ == "__main__":
    train()


# ============================================================
# dataset.yaml 示例 (YOLO 格式):
# ============================================================
# path: ./datasets/mydata          # 数据集根目录
# train: images/train              # 训练图片 (相对 path)
# val: images/val                  # 验证图片
#
# nc: 3                            # 类别数量
# names: ["cat", "dog", "bird"]    # 类别名称
#
# --- 目录结构 ---
# datasets/mydata/
#   images/train/xxx.jpg
#   images/val/xxx.jpg
#   labels/train/xxx.txt           # 每行: class_id cx cy w h (归一化)
#   labels/val/xxx.txt
