#!/bin/bash
# Stop hook: 交付验收 — 确保代码变更后已完成验证
# Exit 0 = 允许结束, Exit 2 = 阻止结束并提示 Claude 继续验证

TRANSCRIPT=$(cat)

# 1. 检查本轮是否修改了代码/配置/文档
HAS_CHANGES=$(echo "$TRANSCRIPT" | grep -cE '"tool_name":\s*"(Edit|Write)"')

if [ "$HAS_CHANGES" -eq 0 ]; then
    exit 0
fi

# 2. 检查是否有验证说明（测试/lint/typecheck/功能验证/TODO检查）
HAS_VERIFY=$(echo "$TRANSCRIPT" | grep -ciE '(测试|test|验证|verify|检查|check|lint|typecheck|build|运行|打开|预览|preview|确认|正常)')

if [ "$HAS_VERIFY" -ge 1 ]; then
    exit 0
fi

# 3. 有变更但无验证 → 阻止结束
cat << 'EOF'
========================================
  STOP BLOCKED — 交付验收未通过
========================================

本轮修改了代码/配置/文档，但未在输出中说明验证结果。

请在结束前完成以下至少一项并说明结果：
  - 测试运行（test）
  - Lint / Typecheck
  - 功能验证 / 浏览器预览
  - TODO 清单检查

验证完成后再次尝试结束。
========================================
EOF

exit 2
