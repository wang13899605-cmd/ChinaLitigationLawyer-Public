# Supplemental Evidence Intake

Use this reference whenever a client or lawyer supplies new evidence after the Matter baseline has been created.

## Preferred Source Location

Place the files in a new append-only batch folder:

```text
08_Cases/<Matter>/00_Original/Client_Supplements/YYYY-MM-DD_batch-N/
```

Keep the client's filenames and folder structure. Do not overwrite an earlier file with the same name; use a new batch folder and record the version relationship. Do not put OCR, renamed copies, annotations, summaries, or converted files here.

## Minimum First Instruction

```text
请处理Matter：08_Cases/<Matter>。
客户补充证据位置：<绝对路径>。
请执行新证据增量更新。
```

Do not require the lawyer to repeat source, receipt date, or batch note in this first message.

## Automatic Metadata Question

After verifying that the Matter and path exist, and before formal evidence registration, ask once:

```text
请补充本批次接收信息：
1. 来源及接收方式（例如客户微信、邮件、纸质移交、移动存储设备）；
2. 实际接收日期；
3. 本批次说明（可选；没有可回复“无”）。
```

Do not ask for a field already supplied. If the note is omitted, continue without asking again. If the source or date is unknown or approximate, preserve that qualifier instead of guessing.

If the current Matter already records that Codex may process its materials, or the lawyer explicitly says “请处理/请执行增量更新”, do not repeat an authorization question. Otherwise add to the same message: “是否授权在当前Codex任务中读取并处理本批材料？该授权不扩大对外上传、发送或共享权限。” The lawyer must still ensure that client and firm rules permit the selected environment.

## Required Incremental Actions

1. Confirm Matter identity and path, without moving, renaming, overwriting, or formally registering files.
2. Ask the one consolidated metadata question above and wait for the answer.
3. After the answer, compare the batch with the existing intake log and register files, source, receipt, transfer method, authorization, hash, readability, duplicates, versions, and anomalies.
4. Allocate new Evidence IDs only to genuinely new evidence units; preserve old IDs.
5. Create derivatives outside `00_Original/` and link them to the original.
6. Perform G3 per-item review and update affected fact-evidence chains.
7. Identify changes to facts, chronology, claims/defenses, deadlines, document plan, calculations, drafts, and strategy.
8. Preserve old conclusions and record old/new provisional views, source of change, and affected outputs.
9. Route F12/F14 and other material decisions to the lawyer; continue unaffected work.

## Direct Chat Upload

A direct attachment can be used for a small, urgent, or pre-Matter review when the current task authorizes processing. Treat the attachment as a temporary input unless it is also saved into the controlled Matter folder. Do not claim it has been archived, hashed against the Matter baseline, or made part of the original evidence set until that step actually occurs.
