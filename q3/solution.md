# Question-3
## Task:
Contribute to open source by getting one genuinely useful small PR merged in a public GitHub repository with 1000+ stars.

This is a mini-tutorial, not a case study: keep the PR tiny, useful, and respectful of maintainer time.

### How to do this responsibly:

1. Choose one active repository with clear contribution guidelines.

2. Find a small issue: typo/docs fix, broken link, tiny test fix, minor bug, or very small code improvement.

3. Open one focused PR with a clear title, concise description, and no unrelated changes.

4. Be respectful in communication. If maintainers request changes, respond quickly and politely.

5. Do not spam multiple repos with low-quality AI-generated PRs.

6. AI + open-source etiquette (important)

7. Many maintainers are currently overloaded by AI-generated low-effort PRs that ignore project context.

8. These PRs cost reviewer time and can create cleanup work even when they are rejected.

9. You should treat maintainer review bandwidth as scarce: send one careful, useful PR instead of many.

10. If AI helps you draft text/code, you are still fully responsible for correctness and relevance.


### What to submit
Paste the merged PR URL as proof of completion.

Keep the repository and PR public until grading is completed.


# Solution:
#### I found one repo which is active and have 1k+ stars and have open issue (easy ones) and accepts every PR within 1 hour. `https://github.com/lingdojo/kana-dojo`

## Step 1:
Make your github account and make sure your student email address is public (not private)

If its private then go to github – Profile – settings – Emails (in left side bar) – Turn off “Keep my email addresses private”

## Step 2:
### Set your commit email :

Open terminal in your pc run that following commands:


    git config --global user.email "Your Email" 
    git config --global user.name "Your Name"

## Step 3: Fork the Repo
1. Go to https://github.com/lingdojo/kana-dojo
2. Click the Fork button (top right)
3. Click Create Fork (Do not change any setting or name)

<img width="1301" height="439" alt="1" src="https://github.com/user-attachments/assets/0482d435-191a-47ef-bb96-0c9f230fd519" />


4. Now you have your own copy at `github.com/YOUR-USERNAME/kana-dojo`

### Step 4: Pick an Issue
1. Go to https://github.com/lingdojo/kana-dojo/issues

<img width="1310" height="563" alt="2" src="https://github.com/user-attachments/assets/12b893b9-b781-4184-8278-09d8f1a3ec3d" />

2. Find the simplest one and recent one -- just like add new comment or text in that json file

<img width="662" height="444" alt="3" src="https://github.com/user-attachments/assets/979e9dbd-1ab2-431b-92a1-7f836517cd97" />


3. Click on it and read exactly what needs to be done

### Step 4: Make the Change on GitHub
1. In your fork `github.com/YOUR-USERNAME/kana-dojo`, navigate to the file that needs editing

<img width="1350" height="353" alt="5" src="https://github.com/user-attachments/assets/98c2211f-c9cd-4515-8214-ca5299c340a1" />


2. Click the pencil icon ✏️ (top right of the file view) to edit
3. Make your changes exactly which are mention in instructions.

<img width="1025" height="313" alt="6" src="https://github.com/user-attachments/assets/02f881dc-9a5d-45b4-90e9-54fc9cddcfae" />


4. Scroll down to "Commit changes"
5. ⚠️ Select "Create a new branch" (not commit to main) — name it something like fix/add-data

<img width="799" height="539" alt="7" src="https://github.com/user-attachments/assets/555ee565-3ed4-4722-8e2a-240df3f13467" />


6. ⚠️ Make sure you are commiting as Your student mail Id
7. Click Propose changes

###Step 6: Open the Pull Request
1. After proposing changes, GitHub will show a Comparing page
2. Click on "compare across froks"

<img width="1118" height="118" alt="8" src="https://github.com/user-attachments/assets/33b58f5e-2414-4d56-ad1c-1591c2388615" />


3.  ##### ⚠️Most important: Make sure it says: base repository: lingdojo/kana-dojo ← head: YOUR-USERNAME/kana-dojo 


<img width="1300" height="305" alt="9" src="https://github.com/user-attachments/assets/755457a0-692a-4b86-a99c-438427eda5cc" />



4. Avoid "Cannot automatically merge" Warning  and click on "Pull request" (green box)
5. Write a clear title like:  `Added Japanese false friends #58`

<img width="1052" height="527" alt="10" src="https://github.com/user-attachments/assets/5020b928-a1f9-4d3b-a975-b544d38bf80a" />



6. In the description write something like:  `Fixes #6180 . Added the entry as described in the issue.`
7. Click Create Pull Request.

### Step 7: Wait for Merge
1. Now your PR is open. (avoid every red errors)

<img width="1012" height="516" alt="11" src="https://github.com/user-attachments/assets/a88f506b-a310-439a-95fb-a6cb829610eb" />



2. Wait for maintainer to merge your Pull request (usally it takes 1-2 hours)
#### Also you have to give a star to maintainers repo then your PR will be acceptable.
3. You'll get a GitHub notification when it's merged
4. Your PR URL will look like: `https://github.com/lingdojo/kana-dojo/pull/123`
5. Copy that URL and submit it as your answer

### ⚠️  One Critical Thing
GitHub uses your primary email for web commits. So before any step, make sure YOUR_MAIL is set as primary in GitHub Settings → Emails. Otherwise your commit won't match and the auto-checker will fail.
