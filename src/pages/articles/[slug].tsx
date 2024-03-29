import { GetStaticPropsContext } from "next";
import Link from "next/link";
import Showdown from "showdown";
import GoSimulate from "../../components/buttons/goSimulate";
import HeadSeo, { defaultMeta } from "../../components/seo/Head";
import { StructuredData } from "../../components/structured-data/StructuredData";
import { Article } from "../../interfaces/article.interface";
import { ArticlesService } from "../../services/articles.service";

interface Props {
	article: Article;
}

export default function ({ article }: Props) {
	const converter = new Showdown.Converter();
	const structured_data = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"@id": `https://www.gartsimulation.com/articles/${article.slug}`,
		mainEntityOfPage: `https://www.gartsimulation.com/article/${article.slug}`,
		headline: article.title,
		description: article.description,
		name: article.title,
		author: {
			"@type": "Person",
			name: "Hernan Castilla",
			url: "https://hernancastilla.com",
		},
		image: [article.image],
	};
	return (
		<div className="container">
			<StructuredData data={structured_data} />
			<HeadSeo
				meta={{
					...defaultMeta,
					title: article.title,
					description: article.description,
					image: `${defaultMeta.url}${article.image}`,
					url: `${defaultMeta.url}/articles/${article.slug}`,
				}}
			/>

			<div className="flex justify-end">
				<Link href='/' passHref>
					<u>go to home</u>
				</Link>
			</div>
			<div className="flex center m3">
				<GoSimulate text="Go Simulation" name={article.slug} />
			</div>

			<div
				className="article-container"
				dangerouslySetInnerHTML={{
					__html: converter.makeHtml(article.content as string),
				}}
			/>
		</div>
	);
}

export async function getStaticProps(context: GetStaticPropsContext) {
	const slug = context.params?.slug;
	const article = await ArticlesService.getArticleBySlug(slug as string);
	if (!article) {
		return {
			notFound: true,
		};
	}
	return {
		props: {
			article: article,
		},
		revalidate: 10,
	};
}

export async function getStaticPaths() {
	try {
		const articles = await ArticlesService.getArticles();
		const paths = articles.map((article: any) => ({
			params: { slug: article.slug },
		}));

		return {
			paths: paths,
			fallback: "blocking",
		};
	} catch (error) {
		console.log(error);
		return { paths: [], fallback: "blocking" };
	}
}
