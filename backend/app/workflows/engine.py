# Minimal stub for workflow engine

class WorkflowEngine:
    def __init__(self):
        pass

    def run(self, workflow: dict, contact_id: int):
        # TODO: implement node execution
        print(f"Running workflow {workflow.get('name')} for contact {contact_id}")
