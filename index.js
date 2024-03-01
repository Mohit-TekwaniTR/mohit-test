document.getElementById('createBranchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
 
    // Get input values
    const branchName = document.getElementById('branchNameInput').value;
    const filePath = document.getElementById('filePath').value;
    console.log(branchName);
 
    // Call function to create a new branch
    createBranch(branchName, filePath);
});
 
async function createBranch(branchName, filePath) {
    const repoOwner = REPO_OWNER;  // give repo owner
    const repoName =  REPO_NAME;  // give repo name
    const token = YOUR_PAT_TOKEN; // your pat token
 
    try {
 
        const branchResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/branches/main`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
       
        if (!branchResponse.ok) {
            throw new Error('Failed to fetch branch information');
        }
       
        const branchData = await branchResponse.json();
        const latestCommitSHA = branchData.commit.sha;
       
        console.log(latestCommitSHA);
       
 
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: latestCommitSHA, // SHA of the branch
            }),
        });
 
        if (!response.ok) {
            throw new Error('Failed to create new branch');
        }
 
        alert(`Created new branch: ${branchName}`);
 
        // Trigger workflow and create codespace
        setTimeout(triggerWorkflowAndCreateCodespace, 30000, branchName, filePath);
    } catch (error) {
        console.error('Error creating new branch:', error);
        alert('Error: ' + error.message);
    }
}
 
async function triggerWorkflowAndCreateCodespace(branchName, filePath) {
    const repoOwner = REPO_OWNER;  // give repo owner
    const repoName =  REPO_NAME;  // give repo name
    const token = YOUR_PAT_TOKEN; // your pat token
    const workflowName = 'codespace-workflow.yml';
    console.log(branchName);
 
    // Trigger GitHub Actions workflow
    const workflowDispatchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowName}/dispatches`;
    const workflowDispatchBody = {
        ref: `refs/heads/${branchName}`,
        inputs: {
            dynamic_path: filePath,
            branch_name : branchName
        }
    };
    const workflowDispatchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(workflowDispatchBody)
    };

 
    try {
        const workflowDispatchResponse = await fetch(workflowDispatchUrl, workflowDispatchOptions);
        if (!workflowDispatchResponse.ok) {
            throw new Error('Failed to trigger GitHub Actions workflow: ' + workflowDispatchResponse.statusText);
        }
        
        setTimeout(getCodeSpaces, 30000, branchName);

    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
    console.log(branchName);
} 
 
async function getCodeSpaces(branchName){
    console.log(branchName);
    const repoOwner = REPO_OWNER;  // give repo owner
    const repoName =  REPO_NAME;  // give repo name
    const token = YOUR_PAT_TOKEN; // your pat token
    const workflowName = 'codespace-workflow.yml';
            // Create codespace
            const createCodespaceUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/codespaces`;
            const createCodespaceBody = {
                ref: `${branchName}`,
                machine: 'standardLinux32gb'
            };
            const createCodespaceOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            };
     
            const createCodespaceResponse = await fetch(createCodespaceUrl, createCodespaceOptions);
            if (!createCodespaceResponse.ok) {
                throw new Error('Failed to create codespace: ' + createCodespaceResponse.statusText);
            }
     
            // Open codespace URL in a new tab
            const createCodespaceData = await createCodespaceResponse.json();
            const codespaces = createCodespaceData.codespaces;
            console.log(codespaces);
            const latestCodespace =codespaces[codespaces.length -1];
            const web_url = latestCodespace.web_url;
            window.open(web_url, '_blank');
            
}
