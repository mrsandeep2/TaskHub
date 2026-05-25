import resend
from config import config

resend.api_key = config.RESEND_API_KEY

def _send(to: str, subject: str, html: str) -> bool:
    try:
        resend.Emails.send({
            "from": f"TaskHub <{config.FROM_EMAIL}>",
            "to": [to],
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False

def _base_template(content: str) -> str:
    return f"""
    <!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width">
    <style>
      body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }}
      .container {{ max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.07); }}
      .header {{ background: linear-gradient(135deg,#7c3aed,#6d28d9); padding: 32px; text-align: center; }}
      .header h1 {{ color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.5px; }}
      .body {{ padding: 32px; color: #1e1e2e; }}
      .body p {{ line-height: 1.7; color: #4a4a5a; margin: 0 0 16px; }}
      .btn {{ display: inline-block; background: #7c3aed; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 8px; }}
      .footer {{ padding: 16px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f0f0f5; }}
    </style></head><body>
    <div class="container">
      <div class="header"><h1>⚡ TaskHub</h1></div>
      <div class="body">{content}</div>
      <div class="footer">© 2024 TaskHub. All rights reserved.</div>
    </div></body></html>"""

def send_task_assigned(to: str, name: str, task_title: str, task_url: str) -> bool:
    content = f"""
    <p>Hi {name},</p>
    <p>A new product photography task has been assigned to you:</p>
    <p><strong style="color:#7c3aed">{task_title}</strong></p>
    <p>Open the task in AI Studio to generate the required product images and submit for review.</p>
    <a href="{task_url}" class="btn">Open Task →</a>"""
    return _send(to, f"New Task Assigned: {task_title}", _base_template(content))

def send_task_submitted(to: str, name: str, task_title: str, review_url: str) -> bool:
    content = f"""
    <p>Hi {name},</p>
    <p>A task has been submitted for your review:</p>
    <p><strong style="color:#7c3aed">{task_title}</strong></p>
    <p>Please review the generated images and either accept or request revisions.</p>
    <a href="{review_url}" class="btn">Review Submission →</a>"""
    return _send(to, f"Task Submitted: {task_title}", _base_template(content))

def send_task_accepted(to: str, name: str, task_title: str) -> bool:
    content = f"""
    <p>Hi {name},</p>
    <p>Great news! Your submission for <strong style="color:#7c3aed">{task_title}</strong> has been accepted.</p>
    <p>The generated product images met the quality requirements. Well done!</p>"""
    return _send(to, f"Task Accepted: {task_title}", _base_template(content))

def send_revision_requested(to: str, name: str, task_title: str, comment: str, task_url: str) -> bool:
    content = f"""
    <p>Hi {name},</p>
    <p>A revision has been requested for: <strong style="color:#7c3aed">{task_title}</strong></p>
    <p><strong>Reviewer notes:</strong></p>
    <blockquote style="border-left:3px solid #7c3aed;margin:0;padding:8px 16px;color:#4a4a5a">{comment}</blockquote>
    <a href="{task_url}" class="btn" style="margin-top:16px">Open AI Studio →</a>"""
    return _send(to, f"Revision Requested: {task_title}", _base_template(content))
