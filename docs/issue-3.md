---
title: "切换 omz 到 zinit + starship"
date: 2026-05-17
issue: 3
issueUrl: "https://github.com/iysun/blogs/issues/3"
readingTime: 4
labels: []
syncedFromIssue: true
layout: IssuePostLayout
pageClass: blog-doc
---

我曾经一直使用的是 oh-my-zsh，其实使用上没有什么问题，但其实我所有到的功能只有 oh-my-zsh 自带的主题以及 zsh-autosuggestions、zsh-syntax-highlighting 这两个zsh插件。所以我想不如干脆使用更轻量的 zinit + starship 替代 oh-my-zsh 算了。

我曾经的 oh-my-zsh 的配置

```bash
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="fox"
plugins=(
  z
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  fzf
  sudo
)
source $ZSH/oh-my-zsh.sh
```

现在的 zinit+starship 配置

```shell
# zinit
ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"
if [ ! -d "$ZINIT_HOME" ]; then
  mkdir -p "$(dirname "$ZINIT_HOME")"
  git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
fi
source "${ZINIT_HOME}/zinit.zsh"
bindkey -e

# non-OMZ plugins
zinit ice as"command" from"gh-r" \
          atclone"./starship init zsh > init.zsh; ./starship completions zsh > _starship" \
          atpull"%atclone" src"init.zsh"
zinit light starship/starship
zinit ice wait lucid
zinit light zsh-users/zsh-autosuggestions
zinit ice wait lucid
zinit light zsh-users/zsh-syntax-highlighting
zinit ice wait lucid
zinit light agkozak/zsh-z
```

至于主题，我喜欢简单干净的感觉，所以我用的是 starship 的 pure preset
