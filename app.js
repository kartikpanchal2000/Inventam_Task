const express= require('express')
const app= express();
const fs= require('fs')
const path= require('path')

const PORT = process.env.PORT ||3000;

//path of json file
const dataPath= path.join(__dirname,'Data','TestJSON.json');

let empData;
fs.readFile(dataPath,'utf8',(err,data)=>
{
    if(err) {
        console.error("Error reading file:", err);
        return;
    }
    empData = JSON.parse(data);
    //console.log(empData);
})

app.use(express.json());

// A -This endpoint will get average budget of all active campaigns from Marketing department

app.get('/api/v1/avg-budget/marketing', (req,res)=>
{
    const marketing=empData.departments.find(dep=>dep.name==='Marketing');
    const activeCampaigns = marketing.teams.flatMap(team=>
        team.campaigns.filter(campaign => campaign.active));        

    const totalBudget = activeCampaigns.reduce((acc, campagin)=> acc+campagin.budget,0);
    const avgBudget=activeCampaigns.length> 0 ? totalBudget/activeCampaigns.length :0;

    res.json({avgBudget});
});

//B - get completed project from Engineering department
app.get('/api/v1/egineering/completed-project', (req,res)=>{

    const engineering=empData.departments.find(dep=> dep.name === 'Engineering' );
    
    const completedProjects = engineering.teams.reduce((acc, team) => {
        return acc.concat(team.projects.filter(project => project.completed));
    }, []);

    console.log(completedProjects);

    if (completedProjects.length === 0) {
        return res.status(200).json({ message: "No completed projects found." });
    }

    res.json(completedProjects);
    });

//C - get single manager who has more running projects or campaigns with high budget projects

app.get('/api/v1/manager/high-budget-projects',(req,res)=>{

    const runningProjects = empData.departments.flatMap(dep => 
        dep.teams.flatMap(team => 
            team.projects ? team.projects.filter(project => !project.completed) : []
        )
    );
    const managerBudget = {};
        
    runningProjects.forEach(project => {
        const team = empData.departments.flatMap(dep => 
            dep.teams.find(t => 
                t.projects && Array.isArray(t.projects) && t.projects.includes(project)
            )
        )[0];
            if (team) {
                const managerName = team.name;
                if (!managerBudget[managerName]) {
                    managerBudget[managerName] = 0;
                }
                managerBudget[managerName] += project.budget;
            }
        });

    const highestManager = Object.entries(managerBudget).reduce((a, b) => a[1] > b[1] ? a : b, [null, 0]);

    res.json({ manager: highestManager[0], totalBudget: highestManager[1] });

});


//D -
app.get('/api/v1/project/same-team',(req,res)=>{

    const projectK={};

    if (empData.departments) {
        empData.departments.forEach(dept => {
          if (dept.teams) {
            dept.teams.forEach(team => {
              if (team.projects) {
                team.projects.forEach(project => {
                  if (project.team_members) {
                
                    const membersKey = project.team_members.sort().join(',');
                    if (!projectK[membersKey]) {
                      projectK[membersKey] = [];
                    }
                    projectK[membersKey].push(project.name);
                  }
                });
              }
            });
          }
        });
      }
    
    const results = Object.values(projectK).filter(projectNames => projectNames.length > 1);
    res.json(results.flat());
});

//  E- category crud: with self join of n-level of sub_category 
//get API should include:  get_by_parent_id 

const categories = []; 
app.post('/api/v1/categories', (req, res) => {
  const newCategory = { id: req.parentId, ...req.body };
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

app.get('/api/v1/categories/:parentId', (req, res) => {
  const parentId = parseInt(req.params.parentId, 10);
  const filteredCategories = categories.filter(category => category.parent_id === parentId);
  res.json(filteredCategories);
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
