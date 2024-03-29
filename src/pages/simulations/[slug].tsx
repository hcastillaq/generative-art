import { GetStaticPropsContext } from "next";
import dynamic from "next/dynamic";
import { useState } from "react";
import HeadSeo, { defaultMeta } from "../../components/seo/Head";
import SimulationStyles from "../../components/simulation/simulation.styles";
import { Context } from "../../context/context";
import { SIMULATIONS } from "../../db/simulations";

interface Props {
	slug: string;
}

const Simulation = dynamic(
	() => import("./../../components/simulation/simulationContainer"),
	{ ssr: false },
);
export default function ({ slug }: Props) {
	const [system, setSystem] = useState(slug);
	const [animation, setAnimation] = useState<any>({
		start: () => {},
		stop: () => {},
		changeColor: () => {},
		takePhoto: () => {},
		changeOpacity: () => {},
	});
	const context = {
		system,
		setSystem,
		animation,
		setAnimation,
	};
	const simulation = SIMULATIONS[system];
	return (
		<>
			<HeadSeo
				meta={{
					...defaultMeta,
					title: simulation.title,
					description: simulation.description,
					url: `${defaultMeta.url}/simulations/${slug}`,
					image: `${defaultMeta.url}/${simulation.image}`,
				}}
			/>
			<Context.Provider value={context}>
				<SimulationStyles>
					<Simulation />
				</SimulationStyles>
			</Context.Provider>
		</>
	);
}

export async function getStaticProps(context: GetStaticPropsContext) {
	const slug = (context.params?.slug || "") as string;
	const names = Object.keys(SIMULATIONS).map((name) =>
		name.toLocaleLowerCase(),
	);
	if (!names.includes(slug.toLocaleLowerCase())) {
		return {
			notFound: true,
		};
	}
	return {
		props: {
			slug,
		},
		revalidate: 10,
	};
}

export async function getStaticPaths() {
	const paths = Object.keys(SIMULATIONS).map((name) => ({
		params: { slug: name },
	}));
	return {
		paths,
		fallback: "blocking",
	};
}
