import csv
import random
import argparse
from pathlib import Path

DEFAULT_VOCAB_FILE = Path(__file__).with_name('vocab.csv')


def load_vocab(path: Path):
    vocab = []
    if not path.exists():
        return vocab
    with path.open(newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 2:
                chinese, english = row[0].strip(), row[1].strip()
                if chinese and english:
                    vocab.append((chinese, english))
    return vocab


def save_vocab(path: Path, vocab):
    with path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for chinese, english in vocab:
            writer.writerow([chinese, english])


def normalize_answer(text: str):
    return ''.join(ch.lower() for ch in text if ch.isalnum() or ch.isspace()).strip()


def quiz(vocab, reverse=False, count=10):
    if not vocab:
        print('目前字庫為空，請先新增單字。')
        return

    questions = vocab.copy()
    random.shuffle(questions)
    questions = questions[:min(count, len(questions))]

    correct = 0
    for idx, (chinese, english) in enumerate(questions, 1):
        if reverse:
            prompt = f'第{idx}題：請翻譯成中文 -> {english}'
            answer = input(prompt + '\n> ').strip()
            expected = chinese
        else:
            prompt = f'第{idx}題：請翻譯成英文 -> {chinese}'
            answer = input(prompt + '\n> ').strip()
            expected = english

        if answer.lower() == 'quit':
            print('已退出測驗。')
            break

        if normalize_answer(answer) == normalize_answer(expected):
            print('答對了！\n')
            correct += 1
        else:
            print(f'答錯了。\n正確答案: {expected}\n')

    print(f'測驗結束，總共答對 {correct} / {idx} 題。')


def add_word(vocab, path: Path):
    print('新增單字，輸入 "quit" 結束。')
    while True:
        chinese = input('中文：').strip()
        if chinese.lower() == 'quit':
            break
        english = input('英文：').strip()
        if english.lower() == 'quit':
            break
        if not chinese or not english:
            print('中文與英文都不能空白，請重新輸入。')
            continue
        vocab.append((chinese, english))
        save_vocab(path, vocab)
        print(f'已新增：{chinese} -> {english}\n')


def list_words(vocab):
    if not vocab:
        print('目前字庫為空。')
        return
    print('目前字庫：')
    for idx, (chinese, english) in enumerate(vocab, 1):
        print(f'{idx}. {chinese} -> {english}')


def main():
    parser = argparse.ArgumentParser(description='簡易背單字工具')
    parser.add_argument('--file', default=str(DEFAULT_VOCAB_FILE), help='單字檔案，預設 vocab.csv')
    parser.add_argument('--reverse', action='store_true', help='從英文測驗中文')
    parser.add_argument('--count', type=int, default=10, help='測驗題數，預設 10 題')
    parser.add_argument('--add', action='store_true', help='新增單字到字庫')
    parser.add_argument('--list', action='store_true', help='列出目前字庫')
    args = parser.parse_args()

    path = Path(args.file)
    vocab = load_vocab(path)

    if args.add:
        add_word(vocab, path)
        return

    if args.list:
        list_words(vocab)
        return

    quiz(vocab, reverse=args.reverse, count=args.count)


if __name__ == '__main__':
    main()
