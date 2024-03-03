import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

export async function handleBranchQrInput(): Promise<void> {
  const branchQr = getInput('branch-qr', { required: false });
  if (branchQr === 'true') {
    // Placeholder for QR code generation logic
    const qrCodeUrl = `https://example.com/qr?branch=${context.ref}`;

    // Assuming the QR code URL is the result of the generation logic
    const githubToken = process.env['GITHUB_TOKEN'];
    if (!githubToken) {
      throw new Error("GitHub token is not available.");
    }
    const octokit = getOctokit(githubToken);

    const commentBody = `Branch QR Code: ![QR Code](${qrCodeUrl})`;

    if (context.issue.number) {
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: context.issue.number,
        body: commentBody,
      });
    } else {
      console.log("Not a pull request or issue context, skipping QR code comment.");
    }
  }
}
