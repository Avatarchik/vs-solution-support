import * as vscode from "vscode";

import * as fs from "fs";
import * as path from "path";
import { INodeItem } from "./inodeitem";
import { SolutionNode } from "./solution";

export class SolutionProvider implements vscode.TreeExplorerNodeProvider<DepNode>, INodeItem {
	kind: string;
	label: string;
	filePath: string;

	constructor(private workspaceRoot: string, private configuration: any, private state: vscode.Memento) {
		this.kind = "root";
	}

	/**
	 * As root node is invisible, its label doesn't matter.
	 */
	getLabel(node: DepNode): string {
		return node.label;
	}

	/**
	 * Leaf is unexpandable.
	 */
	getHasChildren(node: DepNode): boolean {
		return node.kind !== "leaf";
	}

	/**
	 * Invoke `extension.openPackageOnNpm` command when a Leaf node is clicked.
	 */
	getClickCommand(node: DepNode): string {
		return node.kind === "leaf" ? "extension.vs-solution-support.openSolutionTreeItem" : null;
	}

	provideRootNode(): DepNode {
		return this;
	}

	resolveChildren(node: DepNode): Thenable<DepNode[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage("No dependency in empty workspace");
			return Promise.resolve([]);
		}		

		return node.getChildren();
	}

	getChildren(): Thenable<DepNode[]> {		
		return new Promise<DepNode[]>((resolve) => 
		{
			this.filePath = <string>this.configuration.file || fs.readdirSync(this.workspaceRoot).find( _ => _.endsWith(".sln"));
			
			let absolutePath = path.join(this.workspaceRoot, this.filePath );
			this.state.update("solutionFile", absolutePath);

			resolve([ 
				new SolutionNode(absolutePath)
				]
			);
		});
	}
}

export type DepNode = INodeItem;